import { ActivityVisibility, AuditAction, AuditEntity, CaseActivityType, CaseStatus, NotificationType, PermissionCode, ResolutionStatus } from "@prisma/client";
import { requireCompanyPermission } from "../middleware/authorization.js";
import { ServiceError } from "./case-management.service.js";
import { proposeResolutionSchema } from "../validation/case-management.js";
import { prisma } from "../lib/prisma.js";

type CaseActionInput = {
    clerkUserId: string;
    companyId: string;
    caseId: string;
};

// --------------------------------------------------
// PROPOSE A RESOLUTION
// --------------------------------------------------

export async function proposeResolutionService(
    args: CaseActionInput & { input: unknown },
) {
    const { clerkUserId, companyId, caseId } = args;
    const input = proposeResolutionSchema.parse(args.input);

    const actor = await requireCompanyPermission({
        clerkUserId,
        companyId,
        permission: PermissionCode.RESOLUTION_PROPOSE,
    });

    return prisma.$transaction(async (tx) => {
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

        const caseRecord = await tx.case.findFirst({
            where: {
                id: caseId,
                companyId,
                deletedAt: null,
            },
            select: {
                id: true,
                caseNumber: true,
                status: true,
                requesterUserId: true,
            },
        });

        if (!caseRecord) {
            throw new ServiceError(404, "Case not found.");
        }

        if (
            caseRecord.status === CaseStatus.CLOSED ||
            caseRecord.status === CaseStatus.RESOLVED
        ) {
            throw new ServiceError(
                409,
                "Reopen the case before proposing a new resolution.",
            );
        }

        const existingProposal = await tx.caseResolution.findFirst({
            where: {
                caseId,
                status: ResolutionStatus.PROPOSED,
            },
            select: { id: true },
        });

        if (existingProposal) {
            throw new ServiceError(
                409,
                "This case already has a pending resolution proposal.",
            );
        }

        const resolution = await tx.caseResolution.create({
            data: {
                caseId,
                proposedByUserId: actor.userId,
                summary: input.summary,
                details: input.details ?? null,
                status: ResolutionStatus.PROPOSED,
            },
        });

        await tx.caseActivity.create({
            data: {
                companyId,
                caseId,
                actorUserId: actor.userId,
                type: CaseActivityType.RESOLUTION_PROPOSED,
                visibility: ActivityVisibility.INTERNAL,
                summary: "A resolution was proposed",
                metadata: {
                    resolutionId: resolution.id,
                    summary: resolution.summary,
                },
            },
        });

        await tx.auditLog.create({
            data: {
                actorId: actor.userId,
                companyId,
                action: AuditAction.RESOLUTION_PROPOSED,
                entity: AuditEntity.RESOLUTION,
                entityId: resolution.id,
                metadata: {
                    caseId,
                    caseNumber: caseRecord.caseNumber,
                },
            },
        });

        // Notify currently assigned members, excluding the proposer.
        const assignments = await tx.caseAssignment.findMany({
            where: {
                caseId,
                unassignedAt: null,
                member: {
                    status: "ACTIVE",
                    user: {
                        status: "ACTIVE",
                    },
                },
            },
            select: {
                member: {
                    select: {
                        userId: true,
                    },
                },
            },
        });

        const recipientIds = [
            ...new Set(
                assignments
                    .map((assignment) => assignment.member.userId)
                    .filter((userId) => userId !== actor.userId),
            ),
        ];

        if (recipientIds.length > 0) {
            await tx.notification.createMany({
                data: recipientIds.map((userId) => ({
                    userId,
                    companyId,
                    type: NotificationType.RESOLUTION_PROPOSED,
                    title: "Resolution proposed",
                    body: `A resolution has been proposed for case ${caseRecord.caseNumber}.`,
                    actionUrl: `/companies/${companyId}/cases/${caseId}`,
                })),
            });
        }

        await tx.case.update({
            where: { id: caseId },
            data: { lastActivityAt: new Date() },
        });

        return resolution;
    });
}