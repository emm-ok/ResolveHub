import { AuditAction, AuditEntity, CaseStatus, CompanyStatus, MembershipStatus, PermissionCode, UserStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { createCompanySchema, type UpdateCompanyInput } from "../validation/company.js";
import { seedCompanyRoles } from "./company-role.service.js";
import { seedCompanySLAPolicies } from "./sla-policy.service.js";
import { ServiceError } from "./case-management.service.js";
import { requireCompanyPermission } from "../middleware/authorization.js";
import z from "zod";


export class CompanyServiceError extends Error {
    constructor(
        public statusCode: number,
        message: string,
    ) {
        super(message);
        this.name = "CompanyServiceError";
    }
}

function slugify(value: string): string {
    return value
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

interface CreateCompanyOptions {
    clerkUserId: string;
}

export async function createCompany(
    rawInput: unknown,
    { clerkUserId }: CreateCompanyOptions,
) {
    const input = createCompanySchema.parse(rawInput);

    const creator = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
        select: {
            id: true,
            status: true,
        },
    });

    if (!creator || creator.status !== UserStatus.ACTIVE) {
        throw new CompanyServiceError(
            403,
            "An active ResolveHub user profile is required to create a company.",
        );
    }

    const slug = input.slug ?? slugify(input.name);

    if (slug.length < 2) {
        throw new CompanyServiceError(
            400,
            "A valid company slug could not be generated.",
        );
    }

    return prisma.$transaction(async (tx) => {
        const company = await tx.company.create({
            data: {
                name: input.name,
                slug,

                ...(input.email !== undefined && { email: input.email }),
                ...(input.phone !== undefined && { phone: input.phone }),
                ...(input.website !== undefined && { website: input.website }),
                ...(input.logoUrl !== undefined && { logoUrl: input.logoUrl }),
                ...(input.description !== undefined && { description: input.description }),
                ...(input.address !== undefined && { address: input.address }),
                ...(input.city !== undefined && { city: input.city }),
                ...(input.state !== undefined && { state: input.state }),
                ...(input.country !== undefined && { country: input.country }),
                ...(input.timezone !== undefined && { timezone: input.timezone }),
                ...(input.publicIntakeEnabled !== undefined && {
                    publicIntakeEnabled: input.publicIntakeEnabled,
                }),

                createdByUserId: creator.id,
            },
        });

        // Seeds ADMIN, AGENT, INVESTIGATOR and VIEWER only.
        await seedCompanyRoles(company.id, tx);

        // Creates default SLA policies for this company.
        await seedCompanySLAPolicies(company.id, tx);

        // The creator is an ADMIN
        const adminRole = await tx.companyRole.findUnique({
            where: {
                companyId_slug: {
                    companyId: company.id,
                    slug: "admin",
                },
            },
        });

        if (!adminRole) {
            throw new Error(
                "Company initialization failed: default ADMIN role was not created.",
            );
        }

        const membership = await tx.companyMember.create({
            data: {
                companyId: company.id,
                userId: creator.id,
                roleId: adminRole.id,
                status: MembershipStatus.ACTIVE,
            },
            include: {
                role: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        systemRole: true,
                    },
                },
            },
        });

        await tx.auditLog.create({
            data: {
                actorId: creator.id,
                companyId: company.id,
                action: AuditAction.CREATE,
                entity: AuditEntity.COMPANY,
                entityId: company.id,
                metadata: {
                    source: "company-creation",
                },
            },
        });

        return {
            company,
            membership,
        };
    });
}

const allCompaniesQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(150).optional(),
});

export type AllCompaniesQuery = z.infer<typeof allCompaniesQuerySchema>;

export async function getAllCompanies({
    page,
    limit,
    search,
}: AllCompaniesQuery) {

    const where = {
        status: CompanyStatus.ACTIVE,
        ...(search
            ? {
                OR: [
                    { name: { contains: search, mode: "insensitive" as const } },
                    { slug: { contains: search, mode: "insensitive" as const } },
                    { email: { contains: search, mode: "insensitive" as const } },
                ],
            }
            : {}),
    };

    const [companies, total] = await prisma.$transaction([
        prisma.company.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                slug: true,
                logoUrl: true,
                status: true,
            },
        }),
        prisma.company.count({ where }),
    ]);

    return {
        items: companies.map((company) => ({
            id: company.id,
            name: company.name,
            slug: company.slug,
            logoUrl: company.logoUrl,
            status: company.status,
        })),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

interface GetMyCompanyDashboardParams {
    clerkId: string;
}

const RECENT_REQUESTS_LIMIT = 5;

const PENDING_REQUEST_STATUSES = new Set([
    "OPEN",
    "IN_PROGRESS",
    "TRIAGED",
    "WAITING_FOR_CUSTOMER",
    "WAITING_FOR_THIRD_PARTY",
]);

const RESOLVED_CASE_STATUSES = new Set([
    "RESOLVED",
    "CLOSED",
]);

const INACTIVE_CASE_STATUSES = new Set([
    "RESOLVED",
    "CLOSED",
]);

export async function getMyCompanyDashboard({
    clerkId,
}: GetMyCompanyDashboardParams) {
    if (!clerkId) {
        throw new ServiceError(401, "Authentication required.");
    }

    // Resolve the authenticated user through their Clerk ID.
    const user = await prisma.user.findFirst({
        where: {
            clerkId,
            status: UserStatus.ACTIVE,
            deletedAt: null,
        },
        select: {
            id: true,
        },
    });

    if (!user) {
        throw new ServiceError(404, "User account not found.");
    }

    // Find the user's active membership and ensure the company is available.
    const membership = await prisma.companyMember.findFirst({
        where: {
            userId: user.id,
            status: MembershipStatus.ACTIVE,
            company: {
                status: CompanyStatus.ACTIVE,
                deletedAt: null,
            },
        },
        select: {
            id: true,
            role: {
                select: {
                    id: true,
                    name: true,
                },
            },
            department: true,
            jobTitle: true,
            joinedAt: true,
            company: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    email: true,
                    phone: true,
                    website: true,
                    logoUrl: true,
                    description: true,
                    timezone: true,
                    status: true,
                },
            },
        },
    });

    if (!membership) {
        throw new ServiceError(
            403,
            "You do not have an active company membership.",
        );
    }

    const companyId = membership.company.id;

    // Fetch company-scoped statistics and recent requests concurrently.
    const [
        totalRequests,
        requestStatusGroups,
        totalCases,
        caseStatusGroups,
        recentRequests,
    ] = await Promise.all([
        prisma.caseRequest.count({
            where: {
                companyId,
                deletedAt: null,
            },
        }),

        prisma.caseRequest.groupBy({
            by: ["status"],
            where: {
                companyId,
                deletedAt: null,
            },
            _count: {
                _all: true,
            },
        }),

        prisma.case.count({
            where: {
                companyId,
                deletedAt: null,
            },
        }),

        prisma.case.groupBy({
            by: ["status"],
            where: {
                companyId,
                deletedAt: null,
            },
            _count: {
                _all: true,
            },
        }),

        prisma.caseRequest.findMany({
            where: {
                companyId,
                deletedAt: null,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: RECENT_REQUESTS_LIMIT,
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
    ]);

    const pendingRequests = requestStatusGroups.reduce(
        (total: any, group: any) =>
            total +
            (PENDING_REQUEST_STATUSES.has(String(group.status))
                ? group._count._all
                : 0),
        0,
    );

    const resolvedCases = caseStatusGroups.reduce(
        (total: any, group: any) =>
            total +
            (RESOLVED_CASE_STATUSES.has(String(group.status))
                ? group._count._all
                : 0),
        0,
    );

    const activeCases = caseStatusGroups.reduce(
        (total: any, group: any) =>
            total +
            (INACTIVE_CASE_STATUSES.has(String(group.status))
                ? 0
                : group._count._all),
        0,
    );

    return {
        company: membership.company,

        member: {
            membershipId: membership.id,
            role: membership.role
                ? {
                    id: membership.role.id,
                    name: membership.role.name,
                }
                : null,
            department: membership.department,
            jobTitle: membership.jobTitle,
            joinedAt: membership.joinedAt,
        },

        stats: {
            totalRequests,
            pendingRequests,
            totalCases,
            activeCases,
            resolvedCases,
        },

        recentRequests,
    };
}


type CompanyActorInput = {
    clerkUserId: string;
    companyId: string;
};

/**
 * List companies the authenticated user actively belongs to.
 * No company-specific permission is required because this endpoint
 * determines which companies the user can access in the first place.
 */
export async function getCompaniesService(
    clerkUserId: string,
) {
    const user = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
        select: {
            id: true,
            status: true,
        },
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
        throw new ServiceError(401, "Authentication required.");
    }

    const memberships = await prisma.companyMember.findMany({
        where: {
            userId: user.id,
            status: MembershipStatus.ACTIVE,
            company: {
                status: CompanyStatus.ACTIVE,
                deletedAt: null,
            },
        },
        orderBy: {
            company: {
                name: "asc",
            },
        },
        select: {
            id: true,
            role: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    systemRole: true,
                },
            },
            company: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    logoUrl: true,
                    description: true,
                    timezone: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                },
            },
        },
    });

    return memberships.map(({ id, role, company }) => ({
        membershipId: id,
        role,
        company,
    }));
}

/**
 * Get a single company's settings.
 */
export async function getCompanyService({
    clerkUserId,
    companyId,
}: CompanyActorInput) {
    await requireCompanyPermission({
        clerkUserId,
        companyId,
        permission: PermissionCode.COMPANY_SETTINGS_READ,
    });

    const company = await prisma.company.findFirst({
        where: {
            id: companyId,
            status: CompanyStatus.ACTIVE,
            deletedAt: null,
        },
        select: {
            id: true,
            name: true,
            slug: true,
            email: true,
            phone: true,
            website: true,
            logoUrl: true,
            description: true,
            address: true,
            city: true,
            state: true,
            country: true,
            timezone: true,
            publicIntakeEnabled: true,
            status: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    if (!company) {
        throw new ServiceError(404, "Company not found.");
    }

    return company;
}

/**
 * Update company settings and write an audit record atomically.
 */
export async function updateCompanyService({
    clerkUserId,
    companyId,
    input,
}: CompanyActorInput & {
    input: UpdateCompanyInput;
}) {
    const actor = await requireCompanyPermission({
        clerkUserId,
        companyId,
        permission: PermissionCode.COMPANY_SETTINGS_UPDATE,
    });

    return prisma.$transaction(async (tx) => {
        const existing = await tx.company.findFirst({
            where: {
                id: companyId,
                status: CompanyStatus.ACTIVE,
                deletedAt: null,
            },
            select: {
                id: true,
                name: true,
                slug: true,
            },
        });

        if (!existing) {
            throw new ServiceError(404, "Company not found.");
        }

        if (input.slug && input.slug !== existing.slug) {
            const slugExists = await tx.company.findFirst({
                where: {
                    slug: input.slug,
                    id: { not: companyId },
                },
                select: { id: true },
            });

            if (slugExists) {
                throw new ServiceError(
                    409,
                    "This company slug is already in use.",
                );
            }
        }

        const updatedCompany = await tx.company.update({
            where: { id: companyId },
            data: {
                ...(input.name !== undefined && { name: input.name }),
                ...(input.slug !== undefined && { slug: input.slug }),
                ...(input.email !== undefined && { email: input.email }),
                ...(input.phone !== undefined && { phone: input.phone }),
                ...(input.website !== undefined && { website: input.website }),
                ...(input.logoUrl !== undefined && { logoUrl: input.logoUrl }),
                ...(input.description !== undefined && { description: input.description }),
                ...(input.address !== undefined && { address: input.address }),
                ...(input.city !== undefined && { city: input.city }),
                ...(input.state !== undefined && { state: input.state }),
                ...(input.country !== undefined && { country: input.country }),
                ...(input.timezone !== undefined && { timezone: input.timezone }),
                ...(input.publicIntakeEnabled !== undefined && {
                    publicIntakeEnabled: input.publicIntakeEnabled,
                }),
            },
            select: {
                id: true,
                name: true,
                slug: true,
                email: true,
                phone: true,
                website: true,
                logoUrl: true,
                description: true,
                address: true,
                city: true,
                state: true,
                country: true,
                timezone: true,
                publicIntakeEnabled: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        await tx.auditLog.create({
            data: {
                actorId: actor.userId,
                companyId,
                action: AuditAction.UPDATE,
                entity: AuditEntity.COMPANY,
                entityId: companyId,
                metadata: {
                    changedFields: Object.keys(input),
                    previousName: existing.name,
                    previousSlug: existing.slug,
                    updatedName: updatedCompany.name,
                    updatedSlug: updatedCompany.slug,
                },
            },
        });

        return updatedCompany;
    });
}

/**
 * Deactivate a company without permanently deleting its records.
 */
export async function deactivateCompanyService({
    clerkUserId,
    companyId,
    reason,
}: CompanyActorInput & {
    reason?: string;
}) {
    const actor = await requireCompanyPermission({
        clerkUserId,
        companyId,
        permission: PermissionCode.COMPANY_SETTINGS_UPDATE,
    });

    return prisma.$transaction(async (tx) => {
        // Lock the company row so concurrent deactivation attempts
        // cannot both proceed as if the company were still active.
        const lockedCompanies = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT "id"
      FROM "Company"
      WHERE "id" = ${companyId}::uuid
        AND "status" = 'ACTIVE'
        AND "deletedAt" IS NULL
      FOR UPDATE
    `;

        if (lockedCompanies.length === 0) {
            throw new ServiceError(
                404,
                "Company not found or already deactivated.",
            );
        }

        const now = new Date();

        const company = await tx.company.update({
            where: { id: companyId },
            data: {
                status: CompanyStatus.DEACTIVATED,
                deletedAt: now,
            },
            select: {
                id: true,
                name: true,
                slug: true,
                status: true,
                deletedAt: true,
                updatedAt: true,
            },
        });

        await tx.auditLog.create({
            data: {
                actorId: actor.userId,
                companyId,
                action: AuditAction.DELETE,
                entity: AuditEntity.COMPANY,
                entityId: companyId,
                metadata: {
                    operation: "COMPANY_DEACTIVATED",
                    reason: reason ?? null,
                },
            },
        });

        return company;
    });
}