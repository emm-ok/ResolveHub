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


type ResolutionInput = {
    clerkUserId: string;
    companyId: string;
    caseId: string;
};

type ResolutionDecisionInput = ResolutionInput & {
    resolutionId: string;
    reason?: string;
};

const resolutionSelect = {
    id: true,
    summary: true,
    details: true,
    status: true,
    decisionReason: true,
    createdAt: true,
    updatedAt: true,
    proposedByUserId: true,
    decidedByUserId: true,
    proposedBy: {
        select: {
            id: true,
            name: true,
            avatarUrl: true,
        },
    },
    decidedBy: {
        select: {
            id: true,
            name: true,
            avatarUrl: true,
        },
    },
} as const;

/**
 * List resolutions for a company-scoped case.
 */
export async function getCaseResolutionsService({
    clerkUserId,
    companyId,
    caseId,
}: ResolutionInput) {
    await requireCompanyPermission({
        clerkUserId,
        companyId,
        permission: PermissionCode.CASE_READ,
    });

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

    const resolutions = await prisma.caseResolution.findMany({
        where: { caseId },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        select: resolutionSelect,
    });

    return resolutions.map((resolution) => ({
        id: resolution.id,
        summary: resolution.summary,
        details: resolution.details,
        status: resolution.status,
        decisionReason: resolution.decisionReason,
        createdAt: resolution.createdAt,
        updatedAt: resolution.updatedAt,
        proposer: resolution.proposedBy,
        decider: resolution.decidedBy,
    }));
}

/**
 * Accept or reject a proposed resolution.
 */
async function decideResolution({
    clerkUserId,
    companyId,
    caseId,
    resolutionId,
    decision,
    reason,
}: ResolutionDecisionInput & {
    decision: "ACCEPTED" | "REJECTED";
}) {
    // const actor = await requireCompanyPermission({
    //     clerkUserId,
    //     companyId,
    //     permission: PermissionCode.RESOLUTION_DECIDE,
    // });

    const actor = await prisma.user.findUnique({
        where: {
            clerkId: clerkUserId,
        },
        select: {
            id: true
        }
    })

    if(!actor) {
        throw new ServiceError(404, "User not found")
    }

    const actorCase = await prisma.case.findFirst({
        where: {
            createdByUserId: actor?.id
        },
    })

    if(!actorCase) {
        throw new ServiceError(404, "User with Case not found")
    }

    return prisma.$transaction(async (tx) => {
        // Lock the case first so competing decisions serialize.
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

        const caseRecord = await tx.case.findUnique({
            where: { id: caseId },
            select: {
                id: true,
                status: true,
                resolvedAt: true,
                closedAt: true,
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
                "This case has already been resolved or closed.",
            );
        }

        const resolution = await tx.caseResolution.findFirst({
            where: {
                id: resolutionId,
                caseId,
            },
            select: {
                id: true,
                status: true,
                summary: true,
                proposedByUserId: true,
            },
        });

        if (!resolution) {
            throw new ServiceError(404, "Resolution not found.");
        }

        if (resolution.status !== ResolutionStatus.PROPOSED) {
            throw new ServiceError(
                409,
                "Only proposed resolutions can be decided.",
            );
        }

        const now = new Date();

        const updatedResolution = await tx.caseResolution.update({
            where: { id: resolution.id },
            data: {
                status: decision,
                decidedByUserId: actor.id,
                decisionReason: reason ?? null,
            },
            select: {
                id: true,
                summary: true,
                status: true,
                decisionReason: true,
                updatedAt: true,
                decidedByUserId: true,
            },
        });

        if (decision === ResolutionStatus.ACCEPTED) {
            await tx.case.update({
                where: { id: caseId },
                data: {
                    status: CaseStatus.RESOLVED,
                    resolvedAt: now,
                    closedAt: null,
                    lastActivityAt: now,
                },
            });
        } else {
            await tx.case.update({
                where: { id: caseId },
                data: { lastActivityAt: now },
            });
        }

        await tx.caseActivity.create({
            data: {
                companyId,
                caseId,
                actorUserId: actor.id,
                type: decision === ResolutionStatus.ACCEPTED 
                ? CaseActivityType.RESOLUTION_ACCEPTED 
                : CaseActivityType.RESOLUTION_REJECTED,
                visibility: "INTERNAL",
                summary:
                    decision === ResolutionStatus.ACCEPTED
                        ? "Resolution accepted and case resolved."
                        : "Resolution rejected.",
                metadata: {
                    resolutionId: resolution.id,
                    decision,
                    ...(reason ? { reason } : {}),
                },
            },
        });

        await tx.auditLog.create({
            data: {
                actorId: actor.id,
                companyId,
                action: AuditAction.RESOLUTION_DECIDED,
                entity: AuditEntity.RESOLUTION,
                entityId: resolution.id,
                metadata: {
                    caseId,
                    decision,
                    ...(reason ? { reason } : {}),
                },
            },
        });

        return {
            ...updatedResolution,
            case: {
                id: caseRecord.id,
                status:
                    decision === ResolutionStatus.ACCEPTED
                        ? CaseStatus.RESOLVED
                        : caseRecord.status,
                resolvedAt:
                    decision === ResolutionStatus.ACCEPTED ? now : caseRecord.resolvedAt,
            },
        };
    });
}

export async function acceptResolutionService(
    input: ResolutionDecisionInput,
) {
    return decideResolution({
        ...input,
        decision: "ACCEPTED",
    });
}

export async function rejectResolutionService(
    input: ResolutionDecisionInput,
) {
    return decideResolution({
        ...input,
        decision: "REJECTED",
    });
}

/**
 * Only the original proposer can withdraw their own pending proposal.
 */
export async function withdrawResolutionService({
    clerkUserId,
    companyId,
    caseId,
    resolutionId,
}: ResolutionDecisionInput) {
    const actor = await requireCompanyPermission({
        clerkUserId,
        companyId,
        permission: PermissionCode.RESOLUTION_PROPOSE,
    });

    return prisma.$transaction(async (tx) => {
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

        const resolution = await tx.caseResolution.findFirst({
            where: {
                id: resolutionId,
                caseId,
            },
            select: {
                id: true,
                status: true,
                proposedByUserId: true,
            },
        });

        if (!resolution) {
            throw new ServiceError(404, "Resolution not found.");
        }

        if (resolution.proposedByUserId !== actor.userId) {
            throw new ServiceError(
                403,
                "Only the resolution proposer can withdraw it.",
            );
        }

        if (resolution.status !== ResolutionStatus.PROPOSED) {
            throw new ServiceError(
                409,
                "Only proposed resolutions can be withdrawn.",
            );
        }

        const now = new Date();

        const updatedResolution = await tx.caseResolution.update({
            where: { id: resolution.id },
            data: { status: ResolutionStatus.WITHDRAWN },
            select: {
                id: true,
                status: true,
                summary: true,
                updatedAt: true,
            },
        });

        await tx.caseActivity.create({
            data: {
                companyId,
                caseId,
                actorUserId: actor.userId,
                type: CaseActivityType.RESOLUTION_WITHDRAWN,
                visibility: "INTERNAL",
                summary: "Resolution proposal withdrawn.",
                metadata: { resolutionId: resolution.id },
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
                    action: "WITHDRAWN",
                },
            },
        });

        await tx.case.update({
            where: { id: caseId },
            data: { lastActivityAt: now },
        });

        return updatedResolution;
    });
}