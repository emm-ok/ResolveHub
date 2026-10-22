import {
    AuditAction,
    AuditEntity,
    CaseActivityType,
    CaseStatus,
    PermissionCode,
} from "@prisma/client";

import { prisma } from "../lib/prisma.js";
import { ServiceError } from "./case-management.service.js";
import { requireCompanyPermission } from "../middleware/authorization.js";

type EscalateCaseInput = {
    clerkUserId: string;
    companyId: string;
    caseId: string;
    reason: string;
};

export async function escalateCaseService({
    clerkUserId,
    companyId,
    caseId,
    reason,
}: EscalateCaseInput) {
    const actor = await requireCompanyPermission({
        clerkUserId,
        companyId,
        permission: PermissionCode.CASE_ESCALATE,
    });

    return prisma.$transaction(async (tx) => {
        const lockedCases = await tx.$queryRaw<
            Array<{ id: string }>
        >`
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

        const existingCase = await tx.case.findUnique({
            where: { id: caseId },
            select: {
                id: true,
                caseNumber: true,
                title: true,
                status: true,
                isEscalated: true,
            },
        });

        if (!existingCase) {
            throw new ServiceError(404, "Case not found.");
        }

        if (
            existingCase.status === CaseStatus.CLOSED ||
            existingCase.status === CaseStatus.RESOLVED
        ) {
            throw new ServiceError(
                409,
                "Resolved or closed cases cannot be escalated.",
            );
        }

        if (existingCase.isEscalated) {
            throw new ServiceError(
                409,
                "This case has already been escalated.",
            );
        }

        const now = new Date();

        const updatedCase = await tx.case.update({
            where: { id: caseId },
            data: {
                isEscalated: true,
                lastActivityAt: now,
            },
            select: {
                id: true,
                caseNumber: true,
                title: true,
                status: true,
                priority: true,
                isEscalated: true,
                lastActivityAt: true,
                updatedAt: true,
            },
        });

        await tx.caseActivity.create({
            data: {
                companyId,
                caseId,
                actorUserId: actor.userId,
                type: CaseActivityType.ESCALATED,
                visibility: "INTERNAL",
                summary: "Case escalated.",
                metadata: {
                    reason,
                    previousStatus: existingCase.status,
                    caseNumber: existingCase.caseNumber,
                },
            },
        });

        await tx.auditLog.create({
            data: {
                actorId: actor.userId,
                companyId,
                action: AuditAction.CASE_ESCALATED,
                entity: AuditEntity.CASE,
                entityId: caseId,
                metadata: {
                    caseNumber: existingCase.caseNumber,
                    reason,
                    previousEscalated: false,
                    escalated: true,
                },
            },
        });

        return updatedCase;
    });
}