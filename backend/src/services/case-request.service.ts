import { createCaseRequestSchema, rejectCaseRequestSchema } from "../validation/case-request.schema.js";
import {
    AuditAction,
    AuditEntity,
    CaseActivityType,
    CasePriority,
    CaseRequestStatus,
    CaseStatus,
    CompanyStatus,
    UserStatus,
    PermissionCode,
    Prisma,
    RequestChannel,
} from "@prisma/client";

import { prisma } from "../lib/prisma.js";
import { requireCompanyPermission } from "../middleware/authorization.js";

// SUBMIT CASE REQUEST
interface SubmitRequestOptions {
    clerkUserId?: string;
}

export async function submitCaseRequest(
    rawInput: unknown,
    options: SubmitRequestOptions = {},
) {
    const input = createCaseRequestSchema.parse(rawInput);

    return prisma.$transaction(async (tx) => {
        const company = await tx.company.findFirst({
            where: {
                id: input.companyId,
                status: CompanyStatus.ACTIVE,
                deletedAt: null,
                publicIntakeEnabled: true,
            },

            select: {
                id: true,
            },
        });

        if (!company) {
            throw new Error(
                "This company's request submission form is unavailable.",
            );
        }

        let submitterUserId: string | undefined;

        if (options.clerkUserId) {
            const user = await tx.user.findFirst({
                where: {
                    clerkId: options.clerkUserId,
                    status: UserStatus.ACTIVE,
                },

                select: {
                    id: true,
                },
            });

            if (user) {
                submitterUserId = user.id;
            }
        }

        // Serialize request-number generation per company.
        await tx.$queryRaw`
      SELECT id
      FROM "Company"
      WHERE id = ${company.id}::uuid
      FOR UPDATE
    `;

        const year = new Date().getUTCFullYear();

        const prefix = `RH-${year}-`;

        const existingRequests = await tx.caseRequest.findMany({
            where: {
                companyId: company.id,
                requestNumber: {
                    startsWith: prefix,
                },
            },

            select: {
                requestNumber: true,
            },
        });

        const highestNumber = existingRequests.reduce(
            (highest, request) => {
                const suffix = request.requestNumber.slice(prefix.length);
                const number = Number(suffix);

                return Number.isSafeInteger(number)
                    ? Math.max(highest, number)
                    : highest;
            },
            0,
        );

        const requestNumber =
            `${prefix}${String(highestNumber + 1).padStart(6, "0")}`;

        const request = await tx.caseRequest.create({
            data: {
                companyId: company.id,
                requestNumber,

                submitterUserId: submitterUserId ?? null,

                requesterName: input.requesterName,
                requesterEmail: input.requesterEmail,
                requesterPhone: input.requesterPhone ?? null,

                title: input.title,
                description: input.description,
                category: input.category,

                channel: input.channel as RequestChannel,

                status: CaseRequestStatus.SUBMITTED,
            },

            select: {
                id: true,
                requestNumber: true,
                title: true,
                status: true,
                createdAt: true,
            },
        });

        return request;
    });
}


// ACCEPT CASE REQUEST
interface AcceptRequestInput {
    clerkUserId: string;
    companyId: string;
    requestId: string;
}

export async function acceptCaseRequest({
    clerkUserId,
    companyId,
    requestId,
}: AcceptRequestInput) {
    const actor = await requireCompanyPermission({
        clerkUserId,
        companyId,
        permission: PermissionCode.CASE_REQUEST_REVIEW,
    });

    return prisma.$transaction(
        async (tx) => {
            const request = await tx.caseRequest.findFirst({
                where: {
                    id: requestId,
                    companyId,
                    deletedAt: null,
                },
            });

            if (!request) {
                throw new Error("Case request not found.");
            }

            if (
                request.status !== CaseRequestStatus.SUBMITTED &&
                request.status !== CaseRequestStatus.UNDER_REVIEW
            ) {
                throw new Error(
                    "This request cannot be accepted in its current state.",
                );
            }

            if (request.caseId) {
                throw new Error(
                    "This request has already been converted into a case.",
                );
            }

            // All case-number generators must use the same lock.
            await tx.$queryRaw`
                SELECT id
                FROM "Company"
                WHERE id = ${companyId}::uuid
                FOR UPDATE
            `;

            const year = new Date().getUTCFullYear();

            const prefix = `RH-${year}-`;

            const existingCases = await tx.case.findMany({
                where: {
                    companyId,
                    caseNumber: {
                        startsWith: prefix,
                    },
                },

                select: {
                    caseNumber: true,
                },
            });

            const highestNumber = existingCases.reduce(
                (highest, item) => {
                    const suffix = item.caseNumber.slice(prefix.length);
                    const number = Number(suffix);

                    return Number.isSafeInteger(number)
                        ? Math.max(highest, number)
                        : highest;
                },
                0,
            );

            const caseNumber =
                `${prefix}${String(highestNumber + 1).padStart(6, "0")}`;

            const priority =
                request.requestedPriority ?? CasePriority.NORMAL;

            const now = new Date();

            const newCase = await tx.case.create({
                data: {
                    companyId,
                    caseNumber,

                    requestId: request.id,

                    title: request.title,
                    description: request.description,
                    category: request.category,

                    status: CaseStatus.OPEN,
                    priority,

                    origin: mapRequestChannel(request.channel),

                    createdByUserId: actor.userId,
                    requesterUserId: request.submitterUserId,

                    requesterName: request.requesterName,
                    requesterEmail: request.requesterEmail,
                    requesterPhone: request.requesterPhone,

                    lastActivityAt: now,
                },
            });

            await tx.caseRequest.update({
                where: {
                    id: request.id,
                },

                data: {
                    status: CaseRequestStatus.ACCEPTED,
                    reviewedByMemberId: actor.membershipId,
                    reviewedAt: now,
                },
            });

            await tx.caseActivity.create({
                data: {
                    companyId,
                    caseId: newCase.id,
                    actorUserId: actor.userId,

                    type: CaseActivityType.CASE_CREATED,

                    summary: `Case ${caseNumber} was created from request ${request.requestNumber}.`,

                    metadata: {
                        requestId: request.id,
                        requestNumber: request.requestNumber,
                        previousRequestStatus: request.status,
                        newRequestStatus: CaseRequestStatus.ACCEPTED,
                    },
                },
            });

            await tx.auditLog.create({
                data: {
                    actorId: actor.userId,
                    companyId,

                    action: AuditAction.CASE_CREATED,
                    entity: AuditEntity.CASE,
                    entityId: newCase.id,

                    metadata: {
                        caseNumber,
                        requestId: request.id,
                        requestNumber: request.requestNumber,
                    },
                },
            });

            // Snapshot the matching SLA policy if one exists.
            const policy = await tx.sLAPolicy.findFirst({
                where: {
                    companyId,
                    priority,
                    isActive: true,
                    isDefault: true,
                },

                orderBy: {
                    createdAt: "asc",
                },
            });

            if (policy) {
                if (
                    policy.firstResponseMinutes <= 0 ||
                    policy.resolutionMinutes <= 0
                ) {
                    throw new Error(
                        "The configured SLA targets must be positive.",
                    );
                }

                await tx.caseSLA.create({
                    data: {
                        caseId: newCase.id,
                        policyId: policy.id,

                        firstResponseTargetMinutes:
                            policy.firstResponseMinutes,

                        resolutionTargetMinutes:
                            policy.resolutionMinutes,

                        firstResponseDueAt: new Date(
                            now.getTime() +
                            policy.firstResponseMinutes * 60_000,
                        ),

                        resolutionDueAt: new Date(
                            now.getTime() +
                            policy.resolutionMinutes * 60_000,
                        ),
                    },
                });
            }

            return {
                case: newCase,

                request: {
                    id: request.id,
                    requestNumber: request.requestNumber,
                    status: CaseRequestStatus.ACCEPTED,
                },
            };
        },

        {
            isolationLevel:
                Prisma.TransactionIsolationLevel.Serializable,
        },
    );
}

function mapRequestChannel(
    channel: RequestChannel,
): "WEB_FORM" | "EMAIL" | "PHONE" | "CHAT" | "API" | "INTERNAL" {
    switch (channel) {
        case "WEB_FORM":
            return "WEB_FORM";

        case "EMAIL":
            return "EMAIL";

        case "PHONE":
            return "PHONE";

        case "CHAT":
            return "CHAT";

        case "API":
            return "API";

        case "INTERNAL":
            return "INTERNAL";
    }
}



// REJECT CASE REQUEST
interface RejectRequestInput {
    clerkUserId: string;
    companyId: string;
    requestId: string;
    reason: string;
}

export async function rejectCaseRequest({
    clerkUserId,
    companyId,
    requestId,
    reason,
}: RejectRequestInput) {
    const actor = await requireCompanyPermission({
        clerkUserId,
        companyId,
        permission: PermissionCode.CASE_REQUEST_REVIEW,
    });

    const { reason: normalizedReason } = rejectCaseRequestSchema.parse({
        reason: reason,
    });

    if (
        normalizedReason.length < 5 ||
        normalizedReason.length > 1000
    ) {
        throw new Error(
            "Provide a rejection reason between 5 and 1000 characters.",
        );
    }

    return prisma.$transaction(async (tx) => {
        const request = await tx.caseRequest.findFirst({
            where: {
                id: requestId,
                companyId,
                deletedAt: null,
            },
        });

        if (!request) {
            throw new Error("Case request not found.");
        }

        if (
            request.status !== CaseRequestStatus.SUBMITTED &&
            request.status !== CaseRequestStatus.UNDER_REVIEW
        ) {
            throw new Error(
                "This request cannot be rejected in its current state.",
            );
        }

        const updatedRequest = await tx.caseRequest.update({
            where: {
                id: request.id,
            },

            data: {
                status: CaseRequestStatus.REJECTED,
                reviewedByMemberId: actor.membershipId,
                reviewedAt: new Date(),
                rejectionReason: normalizedReason,
            },
        });

        await tx.auditLog.create({
            data: {
                actorId: actor.userId,
                companyId,

                action: AuditAction.CASE_REQUEST_REVIEWED,
                entity: AuditEntity.CASE_REQUEST,
                entityId: request.id,

                metadata: {
                    requestNumber: request.requestNumber,
                    decision: "REJECTED",
                    reason: normalizedReason,
                },
            },
        });

        return updatedRequest;
    });
}