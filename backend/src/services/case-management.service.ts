import {
    ActivityVisibility,
    AuditAction,
    AuditEntity,
    CaseActivityType,
    CaseStatus,
    CommentVisibility,
    MembershipStatus,
    NotificationType,
    PermissionCode,
    Prisma,
    UserStatus,
} from "@prisma/client";

import { prisma } from "../lib/prisma.js";
import { requireCompanyPermission } from "../middleware/authorization.js";
import {
    assignCaseSchema,
    createCommentSchema,
    updateCaseDetailsSchema,
} from "../validation/case-management.js";

export class ServiceError extends Error {
    constructor(
        public readonly statusCode: number,
        message: string,
    ) {
        super(message);
        this.name = "ServiceError";
    }
}

type CommonInput = {
    clerkUserId: string;
    companyId: string;
    caseId: string;
};

async function lockAndGetCase(
    tx: Prisma.TransactionClient,
    companyId: string,
    caseId: string,
) {
    // Prevent simultaneous writes from corrupting assignment history
    // or overwriting concurrent case updates.
    const rows = await tx.$queryRaw<Array<{ id: string }>>`
    SELECT "id"
    FROM "Case"
    WHERE "id" = ${caseId}::uuid
      AND "companyId" = ${companyId}::uuid
      AND "deletedAt" IS NULL
    FOR UPDATE
  `;

    if (rows.length === 0) {
        throw new ServiceError(404, "Case not found.");
    }

    const existingCase = await tx.case.findFirst({
        where: {
            id: caseId,
            companyId,
            deletedAt: null,
        },
    });

    if (!existingCase) {
        throw new ServiceError(404, "Case not found.");
    }

    return existingCase;
}

const statusTransitions: Record<CaseStatus, readonly CaseStatus[]> = {
    [CaseStatus.OPEN]: [
        CaseStatus.TRIAGED,
        CaseStatus.IN_PROGRESS,
        CaseStatus.WAITING_FOR_CUSTOMER,
        CaseStatus.WAITING_FOR_THIRD_PARTY,
        CaseStatus.RESOLVED,
        CaseStatus.CLOSED,
    ],
    [CaseStatus.TRIAGED]: [
        CaseStatus.OPEN,
        CaseStatus.IN_PROGRESS,
        CaseStatus.WAITING_FOR_CUSTOMER,
        CaseStatus.WAITING_FOR_THIRD_PARTY,
        CaseStatus.RESOLVED,
        CaseStatus.CLOSED,
    ],
    [CaseStatus.IN_PROGRESS]: [
        CaseStatus.TRIAGED,
        CaseStatus.WAITING_FOR_CUSTOMER,
        CaseStatus.WAITING_FOR_THIRD_PARTY,
        CaseStatus.RESOLVED,
        CaseStatus.CLOSED,
    ],
    [CaseStatus.WAITING_FOR_CUSTOMER]: [
        CaseStatus.IN_PROGRESS,
        CaseStatus.WAITING_FOR_THIRD_PARTY,
        CaseStatus.RESOLVED,
        CaseStatus.CLOSED,
    ],
    [CaseStatus.WAITING_FOR_THIRD_PARTY]: [
        CaseStatus.IN_PROGRESS,
        CaseStatus.WAITING_FOR_CUSTOMER,
        CaseStatus.RESOLVED,
        CaseStatus.CLOSED,
    ],
    [CaseStatus.RESOLVED]: [
        CaseStatus.OPEN,
        CaseStatus.IN_PROGRESS,
        CaseStatus.CLOSED,
    ],
    [CaseStatus.CLOSED]: [CaseStatus.OPEN],
};

// --------------------------------------------------
// PATCH /:companyId/cases/:caseId
// --------------------------------------------------

export async function updateCaseDetailsService(
    args: CommonInput & { input: unknown },
) {
    const { clerkUserId, companyId, caseId } = args;

    const input = updateCaseDetailsSchema.parse(args.input);

    const actor = await requireCompanyPermission({
        clerkUserId,
        companyId,
        permission: PermissionCode.CASE_UPDATE,
    });

    return prisma.$transaction(async (tx) => {
        const existingCase = await lockAndGetCase(tx, companyId, caseId);
        const now = new Date();

        const data: Prisma.CaseUpdateInput = {};
        const changedFields: string[] = [];

        const addChange = (field: string) => {
            changedFields.push(field);
        };

        if (
            input.title !== undefined &&
            input.title !== existingCase.title
        ) {
            data.title = input.title;
            addChange("title");
        }

        if (
            input.description !== undefined &&
            input.description !== existingCase.description
        ) {
            data.description = input.description;
            addChange("description");
        }

        if (
            input.category !== undefined &&
            input.category !== existingCase.category
        ) {
            data.category = input.category;
            addChange("category");
        }

        if (
            input.priority !== undefined &&
            input.priority !== existingCase.priority
        ) {
            data.priority = input.priority;
            addChange("priority");
        }

        const statusChanged =
            input.status !== undefined &&
            input.status !== existingCase.status;

        const priorityChanged =
            input.priority !== undefined &&
            input.priority !== existingCase.priority;

        const previousStatus = existingCase.status;
        const nextStatus = input.status;

        if (statusChanged && nextStatus) {
            if (!statusTransitions[previousStatus].includes(nextStatus)) {
                throw new ServiceError(
                    409,
                    `Cannot change case status from ${previousStatus} to ${nextStatus}.`,
                );
            }

            // Status-specific permissions must also be granted.
            if (nextStatus === CaseStatus.RESOLVED) {
                await requireCompanyPermission({
                    clerkUserId,
                    companyId,
                    permission: PermissionCode.CASE_RESOLVE,
                });
            }

            if (nextStatus === CaseStatus.CLOSED) {
                await requireCompanyPermission({
                    clerkUserId,
                    companyId,
                    permission: PermissionCode.CASE_CLOSE,
                });
            }

            const reopening =
                ([CaseStatus.RESOLVED, CaseStatus.CLOSED] as CaseStatus[]).includes(previousStatus) &&
                ([CaseStatus.OPEN, CaseStatus.IN_PROGRESS] as CaseStatus[]).includes(nextStatus);

            if (reopening) {
                await requireCompanyPermission({
                    clerkUserId,
                    companyId,
                    permission: PermissionCode.CASE_REOPEN,
                });
            }

            data.status = nextStatus;
            addChange("status");

            if (nextStatus === CaseStatus.RESOLVED) {
                data.resolvedAt = now;
            } else if (
                reopening &&
                ([CaseStatus.RESOLVED, CaseStatus.CLOSED] as CaseStatus[]).includes(previousStatus)
            ) {
                data.resolvedAt = null;
            }

            if (nextStatus === CaseStatus.CLOSED) {
                data.closedAt = now;
            } else if (previousStatus === CaseStatus.CLOSED) {
                data.closedAt = null;
            }
        }

        // Do not update timestamps or create audit entries for a no-op.
        if (changedFields.length === 0) {
            return existingCase;
        }

        data.lastActivityAt = now;

        const updatedCase = await tx.case.update({
            where: { id: caseId },
            data,
        });

        // Record status changes in the case timeline.
        if (statusChanged && nextStatus) {
            const reopening =
                ([CaseStatus.RESOLVED, CaseStatus.CLOSED] as CaseStatus[]).includes(previousStatus) &&
                ([CaseStatus.OPEN, CaseStatus.IN_PROGRESS] as CaseStatus[]).includes(nextStatus);

            await tx.caseActivity.create({
                data: {
                    companyId,
                    caseId,
                    actorUserId: actor.userId,
                    type: reopening
                        ? CaseActivityType.REOPENED
                        : CaseActivityType.STATUS_CHANGED,
                    summary: reopening
                        ? "Case reopened"
                        : `Case status changed to ${nextStatus}`,
                    metadata: {
                        from: previousStatus,
                        to: nextStatus,
                    },
                },
            });

            const action =
                reopening
                    ? AuditAction.CASE_REOPENED
                    : nextStatus === CaseStatus.RESOLVED
                        ? AuditAction.CASE_RESOLVED
                        : nextStatus === CaseStatus.CLOSED
                            ? AuditAction.CASE_CLOSED
                            : AuditAction.CASE_STATUS_CHANGED;

            await tx.auditLog.create({
                data: {
                    actorId: actor.userId,
                    companyId,
                    action,
                    entity: AuditEntity.CASE,
                    entityId: caseId,
                    metadata: {
                        from: previousStatus,
                        to: nextStatus,
                    },
                },
            });
        }

        // Record priority changes in the case timeline.
        if (priorityChanged && input.priority) {
            await tx.caseActivity.create({
                data: {
                    companyId,
                    caseId,
                    actorUserId: actor.userId,
                    type: CaseActivityType.PRIORITY_CHANGED,
                    summary: `Case priority changed to ${input.priority}`,
                    metadata: {
                        from: existingCase.priority,
                        to: input.priority,
                    },
                },
            });

            await tx.auditLog.create({
                data: {
                    actorId: actor.userId,
                    companyId,
                    action: AuditAction.CASE_PRIORITY_CHANGED,
                    entity: AuditEntity.CASE,
                    entityId: caseId,
                    metadata: {
                        from: existingCase.priority,
                        to: input.priority,
                    },
                },
            });
        }

        // Avoid copying potentially sensitive descriptions into audit metadata.
        const ordinaryChanges = changedFields.filter(
            (field) => !["status", "priority"].includes(field),
        );

        if (ordinaryChanges.length > 0) {
            await tx.auditLog.create({
                data: {
                    actorId: actor.userId,
                    companyId,
                    action: AuditAction.UPDATE,
                    entity: AuditEntity.CASE,
                    entityId: caseId,
                    metadata: {
                        changedFields: ordinaryChanges,
                    },
                },
            });
        }

        return updatedCase;
    });
}

// --------------------------------------------------
// POST /:companyId/cases/:caseId/assignments
// --------------------------------------------------

export async function assignCaseService(
    args: CommonInput & { input: unknown },
) {
    const { clerkUserId, companyId, caseId } = args;
    const input = assignCaseSchema.parse(args.input);

    const actor = await requireCompanyPermission({
        clerkUserId,
        companyId,
        permission: PermissionCode.CASE_ASSIGN,
    });

    return prisma.$transaction(async (tx) => {
        const existingCase = await lockAndGetCase(tx, companyId, caseId);

        const assignee = await tx.companyMember.findFirst({
            where: {
                id: input.memberId,
                companyId,
                status: MembershipStatus.ACTIVE,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        status: true,
                    },
                },
                role: {
                    select: {
                        companyId: true,
                    },
                },
            },
        });

        if (!assignee || assignee.role.companyId !== companyId) {
            throw new ServiceError(
                404,
                "Active member not found in this company.",
            );
        }

        if (assignee.user.status !== UserStatus.ACTIVE) {
            throw new ServiceError(
                409,
                "Cannot assign a case to an inactive user.",
            );
        }

        const activeAssignments = await tx.caseAssignment.findMany({
            where: {
                caseId,
                unassignedAt: null,
            },
            include: {
                member: {
                    select: {
                        id: true,
                    },
                },
            },
        });

        // Repeating the same assignment should not create duplicate history.
        if (
            activeAssignments.length === 1 &&
            activeAssignments[0]?.memberId === assignee.id
        ) {
            return {
                assignment: activeAssignments[0],
                unchanged: true,
            };
        }

        const now = new Date();

        if (activeAssignments.length > 0) {
            await tx.caseAssignment.updateMany({
                where: {
                    caseId,
                    unassignedAt: null,
                },
                data: {
                    unassignedAt: now,
                },
            });

            await tx.caseActivity.create({
                data: {
                    companyId,
                    caseId,
                    actorUserId: actor.userId,
                    type: CaseActivityType.UNASSIGNED,
                    summary: "Previous case assignment ended",
                    metadata: {
                        previousMemberIds: activeAssignments.map(
                            (assignment) => assignment.memberId,
                        ),
                    },
                },
            });
        }

        const assignment = await tx.caseAssignment.create({
            data: {
                caseId,
                memberId: assignee.id,
                assignedByMemberId: actor.membershipId,
                note: input.note || null,
            },
            include: {
                member: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        await tx.case.update({
            where: { id: caseId },
            data: { lastActivityAt: now },
        });

        await tx.caseActivity.create({
            data: {
                companyId,
                caseId,
                actorUserId: actor.userId,
                type: CaseActivityType.ASSIGNED,
                summary: `Case assigned to ${assignee.user.name ?? assignee.user.email}`,
                metadata: {
                    assignmentId: assignment.id,
                    memberId: assignee.id,
                },
            },
        });

        await tx.auditLog.create({
            data: {
                actorId: actor.userId,
                companyId,
                action: AuditAction.CASE_ASSIGNED,
                entity: AuditEntity.CASE_ASSIGNMENT,
                entityId: assignment.id,
                metadata: {
                    caseId,
                    assignedMemberId: assignee.id,
                    previousMemberIds: activeAssignments.map(
                        (item) => item.memberId,
                    ),
                },
            },
        });

        // Notify the assignee inside the same transaction.
        if (assignee.user.id !== actor.userId) {
            await tx.notification.create({
                data: {
                    userId: assignee.user.id,
                    companyId,
                    type: NotificationType.CASE_ASSIGNED,
                    title: "Case assigned to you",
                    body: `Case ${existingCase.caseNumber} has been assigned to you.`,
                    actionUrl: `/companies/${companyId}/cases/${caseId}`,
                },
            });
        }

        return {
            assignment,
            unchanged: false,
        };
    });
}

// --------------------------------------------------
// POST /:companyId/cases/:caseId/comments
// --------------------------------------------------

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
