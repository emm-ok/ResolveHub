import {
    ActivityVisibility,
    AuditAction,
    AuditEntity,
    CaseActivityType,
    CommentVisibility,
    NotificationType,
    PermissionCode,
    UserStatus,
} from "@prisma/client";

import { prisma } from "../lib/prisma.js";
import { createCommentSchema } from "../validation/case-management.js";
import { lockAndGetCase, ServiceError, type CommonInput } from "../services/case-management.service.js";
import { requireCompanyPermission } from "../middleware/authorization.js";


export async function createCommentService(
    args: CommonInput & { input: unknown },
) {
    const { clerkUserId, companyId, caseId } = args;
    const input = createCommentSchema.parse(args.input);

    const actor = await requireCompanyPermission({
        clerkUserId,
        companyId,
        permission: PermissionCode.COMMENT_CREATE,
    });

    return prisma.$transaction(async (tx) => {
        const existingCase = await lockAndGetCase(tx, companyId, caseId);

        const author = await tx.user.findUnique({
            where: { id: actor.userId },
            select: {
                id: true,
                name: true,
                email: true,
                status: true,
            },
        });

        if (!author || author.status !== UserStatus.ACTIVE) {
            throw new ServiceError(401, "Active user profile not found.");
        }

        const now = new Date();

        const comment = await tx.caseComment.create({
            data: {
                caseId,
                authorUserId: author.id,
                authorName: author.name,
                authorEmail: author.email,
                body: input.body,
                visibility: input.visibility,
            },
        });

        const activityVisibility =
            input.visibility === CommentVisibility.REQUESTER_VISIBLE
                ? ActivityVisibility.REQUESTER_VISIBLE
                : ActivityVisibility.INTERNAL;

        // Keep the body out of the timeline metadata and audit log.
        await tx.caseActivity.create({
            data: {
                companyId,
                caseId,
                actorUserId: author.id,
                type: CaseActivityType.COMMENT_ADDED,
                visibility: activityVisibility,
                summary:
                    input.visibility === CommentVisibility.REQUESTER_VISIBLE
                        ? "Requester-visible comment added"
                        : "Internal comment added",
                metadata: {
                    commentId: comment.id,
                    visibility: input.visibility,
                },
            },
        });

        await tx.auditLog.create({
            data: {
                actorId: author.id,
                companyId,
                action: AuditAction.COMMENT_CREATED,
                entity: AuditEntity.CASE_COMMENT,
                entityId: comment.id,
                metadata: {
                    caseId,
                    visibility: input.visibility,
                },
            },
        });

        await tx.case.update({
            where: { id: caseId },
            data: { lastActivityAt: now },
        });

        // Only notify a registered requester when the comment is visible to them.
        if (
            input.visibility === CommentVisibility.REQUESTER_VISIBLE &&
            existingCase.requesterUserId &&
            existingCase.requesterUserId !== author.id
        ) {
            await tx.notification.create({
                data: {
                    userId: existingCase.requesterUserId,
                    companyId,
                    type: NotificationType.NEW_COMMENT,
                    title: "New update on your case",
                    body: `A new update was added to case ${existingCase.caseNumber}.`,
                    actionUrl: `/my-cases/${caseId}`,
                },
            });
        }

        return comment;
    });
}


type CaseCommentsInput = {
    clerkUserId: string;
    companyId: string;
    caseId: string;
};

type DeleteCommentInput = CaseCommentsInput & {
    commentId: string;
};

async function ensureCaseExists(
    companyId: string,
    caseId: string,
) {
    const caseRecord = await prisma.case.findFirst({
        where: {
            id: caseId,
            companyId,
            deletedAt: null,
        },
        select: { id: true },
    });

    if (!caseRecord) {
        throw new ServiceError(404, "Case not found.");
    }
}

export async function getCaseCommentsService({
    clerkUserId,
    companyId,
    caseId,
    page = 1,
    limit = 20,
}: CaseCommentsInput & {
    page?: number;
    limit?: number;
}) {
    await requireCompanyPermission({
        clerkUserId,
        companyId,
        permission: PermissionCode.CASE_READ,
    });

    await ensureCaseExists(companyId, caseId);

    const skip = (page - 1) * limit;

    const where = { caseId };

    const [comments, total] = await prisma.$transaction([
        prisma.caseComment.findMany({
            where,
            orderBy: [{ createdAt: "asc" }, { id: "asc" }],
            skip,
            take: limit,
            select: {
                id: true,
                body: true,
                visibility: true,
                createdAt: true,
                updatedAt: true,
                authorUserId: true,
                authorName: true,
                authorEmail: true,
            },
        }),

        prisma.caseComment.count({ where }),
    ]);

    // Fetch registered authors in one query rather than one query per comment.
    const authorIds = [
        ...new Set(
            comments
                .map((comment) => comment.authorUserId)
                .filter((id): id is string => id !== null),
        ),
    ];

    const authors = authorIds.length
        ? await prisma.user.findMany({
            where: { id: { in: authorIds } },
            select: {
                id: true,
                name: true,
                avatarUrl: true,
            },
        })
        : [];

    const authorById = new Map(
        authors.map((author) => [author.id, author]),
    );

    return {
        items: comments.map((comment) => ({
            id: comment.id,
            body: comment.body,
            visibility: comment.visibility,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
            author: comment.authorUserId
                ? authorById.get(comment.authorUserId) ?? {
                    id: comment.authorUserId,
                    name: comment.authorName,
                    avatarUrl: null,
                }
                : {
                    id: null,
                    name: comment.authorName,
                    avatarUrl: null,
                },
        })),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export async function deleteCommentService({
    clerkUserId,
    companyId,
    caseId,
    commentId,
}: DeleteCommentInput) {
    const actor = await requireCompanyPermission({
        clerkUserId,
        companyId,
        permission: PermissionCode.COMMENT_CREATE,
    });

    return prisma.$transaction(async (tx) => {
        // Lock the case to serialize comment changes against case activity updates.
        const lockedCases = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT "id"
      FROM "Case"
      WHERE "id" = ${caseId}::uuid
        AND "companyId" = ${companyId}::uuid
        AND "deletedAt" IS NULL
      FOR UPDATE
    `;

        if (lockedCases.length === 0) {
            throw new ServiceError(404, "Case not found.");
        }

        const comment = await tx.caseComment.findFirst({
            where: {
                id: commentId,
                caseId,
            },
            select: {
                id: true,
                authorUserId: true,
            },
        });

        if (!comment) {
            throw new ServiceError(404, "Comment not found.");
        }

        // Users may remove their own comments. Administrators may moderate comments.
        if (
            comment.authorUserId !== actor.userId &&
            actor.role.name !== "ADMIN"
        ) {
            throw new ServiceError(
                403,
                "You are not allowed to delete this comment.",
            );
        }

        await tx.caseComment.delete({
            where: { id: comment.id },
        });

        const deletedAt = new Date();

        await tx.auditLog.create({
            data: {
                actorId: actor.userId,
                companyId,
                action: AuditAction.DELETE,
                entity: AuditEntity.CASE_COMMENT,
                entityId: comment.id,
                metadata: { caseId },
            },
        });

        await tx.case.update({
            where: { id: caseId },
            data: { lastActivityAt: deletedAt },
        });

        return {
            id: comment.id,
            caseId,
            deletedAt,
        };
    });
}