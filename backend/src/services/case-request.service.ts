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
import z from "zod";
import { ServiceError } from "./case-management.service.js";

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
            throw new ServiceError(
                404, "This company's request submission form is unavailable.",
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
                throw new ServiceError(404,"Case request not found.");
            }

            if (
                request.status !== CaseRequestStatus.SUBMITTED &&
                request.status !== CaseRequestStatus.UNDER_REVIEW
            ) {
                throw new ServiceError(
                    409, "This request cannot be accepted in its current state.",
                );
            }

            const existingCase = await tx.case.findUnique({
                where: {
                    requestId: request.id,
                },
                select: {
                    id: true
                }
            })

            if (request.caseId || existingCase) {
                throw new ServiceError(
                    409, "This request has already been converted into a case.",
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
                    caseId: newCase.id,
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
                    throw new ServiceError(
                        400, "The configured SLA targets must be positive.",
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

    // const { reason: normalizedReason } = rejectCaseRequestSchema.parse({
    //     reason,
    // });

    // TEST - Will remove later on
    const normalizedReason = z
        .string()
        .trim()
        .min(10, "Rejection reason must contain at least 10 characters.")
        .max(1000, "Rejection reason cannot exceed 1000 characters.")
        .parse(reason);

    if (
        normalizedReason.length < 5 ||
        normalizedReason.length > 1000
    ) {
        throw new ServiceError(
           400, "Provide a rejection reason between 5 and 1000 characters.",
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
            throw new ServiceError(404, "Case request not found.");
        }

        if (
            request.status !== CaseRequestStatus.SUBMITTED &&
            request.status !== CaseRequestStatus.UNDER_REVIEW
        ) {
            throw new ServiceError(
                409, "This request cannot be rejected in its current state.",
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




interface ListCaseRequestsInput {
    clerkUserId: string;
    companyId: string;
    page: number;
    limit: number;
    search?: string;
    status?: CaseRequestStatus;
    sortOrder: "asc" | "desc";
}

interface ListMyCaseRequestsInput {
    clerkUserId: string;
    page: number;
    limit: number;
    search?: string;
    status?: CaseRequestStatus;
    sortOrder: "asc" | "desc";
}

interface GetCaseRequestInput {
    clerkUserId: string;
    companyId: string;
    requestId: string;
}
interface GetMyCaseRequestInput {
    clerkUserId: string;
    requestId: string;
}
export async function getMyCaseRequests({
    clerkUserId,
    page,
    limit,
    search,
    status,
    sortOrder,
}: ListMyCaseRequestsInput) {

    const user = await prisma.user.findUnique({
        where: {
            clerkId: clerkUserId,
        },
        select: {
            id: true,
        }
    })

    if (!user) {
        throw new ServiceError(404, "User not found")
    }

    const where: Prisma.CaseRequestWhereInput = {
        submitterUserId: user.id,
        deletedAt: null,
        ...(status ? { status } : {}),
        ...(search
            ? {
                OR: [
                    { requestNumber: { contains: search, mode: "insensitive" } },
                    { title: { contains: search, mode: "insensitive" } },
                ],
            }
            : {}),
    };

    const [requests, total] = await prisma.$transaction([
        prisma.caseRequest.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: sortOrder },
            select: {
                id: true,
                requestNumber: true,
                title: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                reviewedAt: true,
                rejectionReason: true,
            },
        }),
        prisma.caseRequest.count({ where }),
    ]);

    return {
        items: requests,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page * limit < total,
            hasPreviousPage: page > 1,
        },
    };
}

export async function getMyCaseRequest({
    clerkUserId,
    requestId,
}: GetMyCaseRequestInput) {
    const user = await prisma.user.findUnique({
        where: {
            clerkId: clerkUserId,
        },
        select: {
            id: true,
        }
    })

    if (!user) {
        throw new ServiceError(404, "User not found")
    }

    const request = await prisma.caseRequest.findFirst({
        where: {
            id: requestId,
            submitterUserId: user.id,
            deletedAt: null,
        },
        select: {
            id: true,
            requestNumber: true,
            title: true,
            description: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            reviewedAt: true,
            rejectionReason: true,
            // Add customer and linked-case relations using your actual schema.
        },
    });

    if (!request) {
        throw new ServiceError(404, "Case request not found.");
    }

    return request;
}

export async function getCaseRequests({
    clerkUserId,
    companyId,
    page,
    limit,
    search,
    status,
    sortOrder,
}: ListCaseRequestsInput) {
    await requireCompanyPermission({
        clerkUserId,
        companyId,
        permission: PermissionCode.CASE_REQUEST_READ,
    });

    const where: Prisma.CaseRequestWhereInput = {
        companyId,
        deletedAt: null,
        ...(status ? { status } : {}),
        ...(search
            ? {
                OR: [
                    { requestNumber: { contains: search, mode: "insensitive" } },
                    { title: { contains: search, mode: "insensitive" } },
                ],
            }
            : {}),
    };

    const [requests, total] = await prisma.$transaction([
        prisma.caseRequest.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: sortOrder },
            select: {
                id: true,
                requestNumber: true,
                title: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                reviewedAt: true,
                rejectionReason: true,
            },
        }),
        prisma.caseRequest.count({ where }),
    ]);

    return {
        items: requests,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page * limit < total,
            hasPreviousPage: page > 1,
        },
    };
}

export async function getCaseRequest({
    clerkUserId,
    companyId,
    requestId,
}: GetCaseRequestInput) {
    await requireCompanyPermission({
        clerkUserId,
        companyId,
        permission: PermissionCode.CASE_REQUEST_READ,
    });

    let request
    request = await prisma.caseRequest.findFirst({
        where: {
            id: requestId,
            companyId,
            deletedAt: null,
        },
        select: {
            id: true,
            requestNumber: true,
            title: true,
            description: true,
            category: true,
            requestedPriority: true,
            channel: true,
            requesterName: true,
            requesterEmail: true,
            requesterPhone: true,
            caseId: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            reviewedAt: true,
            rejectionReason: true,
        },

    });

    if (!request) {
        throw new ServiceError(404,"Case request not found.");
    }

    if (request.status === CaseRequestStatus.SUBMITTED) {
        request = await prisma.caseRequest.update({
            where: {
                id: requestId,
                companyId,
                deletedAt: null
            },
            data: {
                status: CaseRequestStatus.UNDER_REVIEW,
            },
            select: {
                id: true,
                requestNumber: true,
                title: true,
                description: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                reviewedAt: true,
                rejectionReason: true,
                // Add customer and linked-case relations using your actual schema.
            },
        })
    }

    return request;
}



interface ListCasesInput {
    clerkUserId: string;
    companyId: string;
    page: number;
    limit: number;
    search?: string;
    status?: CaseStatus;
    sortOrder: "asc" | "desc";
}

interface GetCaseDetailsInput {
    clerkUserId: string;
    companyId: string;
    caseId: string;
}

export async function getCases({
    clerkUserId,
    companyId,
    page,
    limit,
    search,
    status,
    sortOrder,
}: ListCasesInput) {
    await requireCompanyPermission({
        clerkUserId,
        companyId,
        permission: PermissionCode.CASE_REQUEST_REVIEW,
    });

    const where: Prisma.CaseWhereInput = {
        companyId,
        ...(status ? { status } : {}),
        ...(search
            ? {
                OR: [
                    { caseNumber: { contains: search, mode: "insensitive" } },
                    { title: { contains: search, mode: "insensitive" } },
                ],
            }
            : {}),
    };

    const [cases, total] = await prisma.$transaction([
        prisma.case.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: sortOrder },
            select: {
                id: true,
                caseNumber: true,
                title: true,
                category: true,
                status: true,
                priority: true,
                createdAt: true,
                updatedAt: true,
            },
        }),
        prisma.case.count({ where }),
    ]);

    return {
        items: cases,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page * limit < total,
            hasPreviousPage: page > 1,
        },
    };
}

export async function getCaseDetails({
    clerkUserId,
    companyId,
    caseId,
}: GetCaseDetailsInput) {
    await requireCompanyPermission({
        clerkUserId,
        companyId,
        permission: PermissionCode.CASE_REQUEST_REVIEW,
    });

    const caseRecord = await prisma.case.findFirst({
        where: {
            id: caseId,
            companyId,
        },
        select: {
            id: true,
            caseNumber: true,
            title: true,
            description: true,
            category: true,
            status: true,
            priority: true,
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    memberships: {
                        select: {
                            role: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                }
            },
            request: {
                select: {
                    id: true,
                    requestNumber: true
                }
            },
            assignments: {
                select: {
                    member: {
                        select: {
                            user: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                }
            },
            sla: {
                include: {
                    policy: true
                }
            },
            activities: {
                include: {},
                orderBy: { createdAt: "desc" }
            },
            createdAt: true,
            updatedAt: true,
        },
    });

    if (!caseRecord) {
        throw new ServiceError(404, "Case not found.");
    }

    return caseRecord;
}
