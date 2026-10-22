import {
    AuditAction,
    AuditEntity,
    CompanyStatus,
    PermissionCode,
    UserStatus,
} from "@prisma/client";

import { prisma } from "../lib/prisma.js";
import { ServiceError } from "./case-management.service.js";

import type {
    AllCompaniesQuery,
    AuditLogsQuery,
} from "../validation/company-admin.js";
import { requireCompanyPermission } from "../middleware/authorization.js";

async function requirePlatformAdmin(clerkUserId: string) {
    const user = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
        select: {
            id: true,
            status: true,
            platformRole: true,
        },
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
        throw new ServiceError(401, "Authentication required.");
    }

    if (String(user.platformRole) !== "ADMIN") {
        throw new ServiceError(
            403,
            "Platform administrator access is required.",
        );
    }

    return user;
}

/**
 * Reactivate a deactivated company.
 * Restores status to ACTIVE and clears the soft-deletion timestamp.
 */
export async function reactivateCompanyService({
    clerkUserId,
    companyId,
}: {
    clerkUserId: string;
    companyId: string;
}) {
    const actor = await requirePlatformAdmin(clerkUserId);

    return prisma.$transaction(async (tx) => {
        const lockedCompanies = await tx.$queryRaw<
            Array<{ id: string; status: CompanyStatus }>
        >`
      SELECT "id", "status"
      FROM "Company"
      WHERE "id" = ${companyId}::uuid
      FOR UPDATE
    `;

        const existing = lockedCompanies[0];

        if (!existing) {
            throw new ServiceError(404, "Company not found.");
        }

        if (existing.status === CompanyStatus.ACTIVE) {
            throw new ServiceError(409, "Company is already active.");
        }

        const now = new Date();

        const company = await tx.company.update({
            where: { id: companyId },
            data: {
                status: CompanyStatus.ACTIVE,
                deletedAt: null,
            },
            select: {
                id: true,
                name: true,
                slug: true,
                logoUrl: true,
                status: true,
                deletedAt: true,
                updatedAt: true,
            },
        });

        await tx.auditLog.create({
            data: {
                actorId: actor.id,
                companyId,
                action: AuditAction.UPDATE,
                entity: AuditEntity.COMPANY,
                entityId: companyId,
                metadata: {
                    operation: "COMPANY_REACTIVATED",
                    previousStatus: existing.status,
                    newStatus: CompanyStatus.ACTIVE,
                    reactivatedAt: now.toISOString(),
                },
            },
        });

        return company;
    });
}

/**
 * List companies for the platform-admin dashboard.
 * Includes active, suspended, and deactivated companies.
 */
export async function getAllCompaniesService({
    clerkUserId,
    page,
    limit,
    search,
    status,
}: {
    clerkUserId: string;
} & AllCompaniesQuery) {
    await requirePlatformAdmin(clerkUserId);

    const where = {
        ...(status ? { status } : {}),
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
                email: true,
                logoUrl: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                deletedAt: true,
                _count: {
                    select: {
                        memberships: {
                            where: { status: "ACTIVE" },
                        },
                        cases: {
                            where: { deletedAt: null },
                        },
                        caseRequests: true,
                    },
                },
            },
        }),
        prisma.company.count({ where }),
    ]);

    return {
        items: companies.map((company) => ({
            id: company.id,
            name: company.name,
            slug: company.slug,
            email: company.email,
            logoUrl: company.logoUrl,
            status: company.status,
            createdAt: company.createdAt,
            updatedAt: company.updatedAt,
            deletedAt: company.deletedAt,
            counts: {
                activeMembers: company._count.memberships,
                cases: company._count.cases,
                caseRequests: company._count.caseRequests,
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

/**
 * Get audit logs.
 *
 * - With companyId: requires AUDIT_READ for that company.
 * - Without companyId: requires platform administrator access.
 *
 * Supports pagination and optional action/entity filters.
 */
export async function getAuditLogsService({
    clerkUserId,
    companyId,
    page,
    limit,
    action,
    entity,
    entityId,
}: {
    clerkUserId: string;
} & AuditLogsQuery) {
    if (companyId) {
        await requireCompanyPermission({
            clerkUserId,
            companyId,
            permission: PermissionCode.AUDIT_READ,
        });
    } else {
        await requirePlatformAdmin(clerkUserId);
    }

    const where = {
        ...(companyId ? { companyId } : {}),
        ...(action ? { action } : {}),
        ...(entity ? { entity } : {}),
        ...(entityId ? { entityId } : {}),
    };

    const [logs, total] = await prisma.$transaction([
        prisma.auditLog.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                companyId: true,
                actorId: true,
                action: true,
                entity: true,
                entityId: true,
                metadata: true,
                requestId: true,
                createdAt: true,
                company: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
        }),
        prisma.auditLog.count({ where }),
    ]);

    // Resolve actor names/emails in one batched query.
    const actorIds = [
        ...new Set(
            logs
                .map((log) => log.actorId)
                .filter((id): id is string => Boolean(id)),
        ),
    ];

    const actors = actorIds.length
        ? await prisma.user.findMany({
            where: { id: { in: actorIds } },
            select: {
                id: true,
                name: true,
                email: true,
            },
        })
        : [];

    const actorsById = new Map(
        actors.map((actor) => [actor.id, actor]),
    );

    return {
        items: logs.map((log) => ({
            id: log.id,
            companyId: log.companyId,
            company: log.company,
            action: log.action,
            entity: log.entity,
            entityId: log.entityId,
            metadata: log.metadata,
            requestId: log.requestId,
            createdAt: log.createdAt,
            actor: log.actorId
                ? actorsById.get(log.actorId) ?? null
                : null,
        })),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}