
import {
    CaseStatus,
    CompanyStatus,
    PermissionCode,
} from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { ServiceError } from "./case-management.service.js";
import type { CompanyReportQuery } from "../validation/company-reporting.js";
import { requireCompanyPermission } from "../middleware/authorization.js";

async function requireReportingAccess(
    clerkUserId: string,
    companyId: string,
) {
    await requireCompanyPermission({
        clerkUserId,
        companyId,
        permission: "CASE_READ" as PermissionCode,
    });

    const company = await prisma.company.findFirst({
        where: {
            id: companyId,
            status: CompanyStatus.ACTIVE,
            deletedAt: null,
        },
        select: { id: true },
    });

    if (!company) {
        throw new ServiceError(404, "Company not found.");
    }
}

const openCaseStatuses: CaseStatus[] = [
    CaseStatus.OPEN,
    CaseStatus.TRIAGED,
    CaseStatus.IN_PROGRESS,
    CaseStatus.WAITING_FOR_CUSTOMER,
    CaseStatus.WAITING_FOR_THIRD_PARTY,
];

/**
 * GET /companies/:companyId/dashboard
 */
export async function getCompanyDashboardService({
    clerkUserId,
    companyId,
}: {
    clerkUserId: string;
    companyId: string;
}) {
    await requireReportingAccess(clerkUserId, companyId);

    const baseWhere = {
        companyId,
        deletedAt: null,
    };

    const [
        totalCases,
        openCases,
        resolvedCases,
        closedCases,
        escalatedCases,
        casesByStatus,
        casesByPriority,
        casesByCategory,
        activeMemberCount,
        activeAssignmentGroups,
    ] = await Promise.all([
        prisma.case.count({ where: baseWhere }),

        prisma.case.count({
            where: {
                ...baseWhere,
                status: { in: openCaseStatuses },
            },
        }),

        prisma.case.count({
            where: { ...baseWhere, status: CaseStatus.RESOLVED },
        }),

        prisma.case.count({
            where: { ...baseWhere, status: CaseStatus.CLOSED },
        }),

        prisma.case.count({
            where: { ...baseWhere, isEscalated: true },
        }),

        prisma.case.groupBy({
            by: ["status"],
            where: baseWhere,
            _count: { _all: true },
        }),

        prisma.case.groupBy({
            by: ["priority"],
            where: baseWhere,
            _count: { _all: true },
        }),

        prisma.case.groupBy({
            by: ["category"],
            where: baseWhere,
            _count: { _all: true },
        }),

        prisma.companyMember.count({
            where: {
                companyId,
                status: "ACTIVE",
                user: { status: "ACTIVE" },
            },
        }),

        prisma.caseAssignment.groupBy({
            by: ["memberId"],
            where: {
                unassignedAt: null,
                case: {
                    companyId,
                    deletedAt: null,
                    status: { in: openCaseStatuses },
                },
                member: {
                    companyId,
                    status: "ACTIVE",
                    user: { status: "ACTIVE" },
                },
            },
            _count: { _all: true },
            orderBy: {
                _count: { memberId: "desc" },
            },
            take: 10,
        }),
    ]);

    const workloadMemberIds = activeAssignmentGroups.map(
        (item) => item.memberId,
    );

    const workloadMembers = workloadMemberIds.length
        ? await prisma.companyMember.findMany({
            where: {
                id: { in: workloadMemberIds },
                companyId,
            },
            select: {
                id: true,
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                role: {
                    select: {
                        name: true,
                    },
                },
            },
        })
        : [];

    const workloadByMember = new Map(
        workloadMembers.map((member) => [member.id, member]),
    );

    return {
        summary: {
            totalCases,
            openCases,
            resolvedCases,
            closedCases,
            escalatedCases,
            activeMembers: activeMemberCount,
        },
        casesByStatus: casesByStatus.map((item) => ({
            status: item.status,
            count: item._count._all,
        })),
        casesByPriority: casesByPriority.map((item) => ({
            priority: item.priority,
            count: item._count._all,
        })),
        casesByCategory: casesByCategory.map((item) => ({
            category: item.category,
            count: item._count._all,
        })),
        workload: activeAssignmentGroups.map((item) => {
            const member = workloadByMember.get(item.memberId);

            return {
                memberId: item.memberId,
                name: member?.user.name ?? null,
                email: member?.user.email ?? null,
                role: member?.role.name ?? null,
                activeAssignedCases: item._count._all,
            };
        }),
        generatedAt: new Date().toISOString(),
    };
}

/**
 * GET /companies/:companyId/reports
 *
 * Filters cases by creation date, status, priority, category and
 * current active assignee. Results are bounded and paginated.
 */
export async function getCompanyReportsService({
    clerkUserId,
    companyId,
    query,
}: {
    clerkUserId: string;
    companyId: string;
    query: CompanyReportQuery;
}) {
    await requireReportingAccess(clerkUserId, companyId);

    const {
        startDate,
        endDate,
        status,
        priority,
        category,
        assignedMemberId,
        page,
        limit,
    } = query;

    const where = {
        companyId,
        deletedAt: null,
        ...(status ? { status } : {}),
        ...(priority ? { priority } : {}),
        ...(category ? { category } : {}),
        ...(startDate || endDate
            ? {
                createdAt: {
                    ...(startDate ? { gte: new Date(startDate) } : {}),
                    ...(endDate ? { lte: new Date(endDate) } : {}),
                },
            }
            : {}),
        ...(assignedMemberId
            ? {
                assignments: {
                    some: {
                        memberId: assignedMemberId,
                        unassignedAt: null,
                    },
                },
            }
            : {}),
    };

    const [
        total,
        cases,
        statusGroups,
        priorityGroups,
        categoryGroups,
    ] = await prisma.$transaction([
        prisma.case.count({ where }),

        prisma.case.findMany({
            where,
            orderBy: [
                { createdAt: "desc" },
                { id: "asc" },
            ],
            skip: (page - 1) * limit,
            take: limit,
            select: {
                id: true,
                caseNumber: true,
                title: true,
                status: true,
                priority: true,
                category: true,
                isEscalated: true,
                createdAt: true,
                updatedAt: true,
                resolvedAt: true,
                closedAt: true,
                assignments: {
                    where: { unassignedAt: null },
                    take: 1,
                    orderBy: { assignedAt: "desc" },
                    select: {
                        member: {
                            select: {
                                id: true,
                                user: {
                                    select: {
                                        name: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        }),

        prisma.case.groupBy({
            by: ["status"],
            where,
            _count: { _all: true },
        }),

        prisma.case.groupBy({
            by: ["priority"],
            where,
            _count: { _all: true },
        }),

        prisma.case.groupBy({
            by: ["category"],
            where,
            _count: { _all: true },
        }),
    ]);

    return {
        filters: {
            startDate: startDate ?? null,
            endDate: endDate ?? null,
            status: status ?? null,
            priority: priority ?? null,
            category: category ?? null,
            assignedMemberId: assignedMemberId ?? null,
        },
        summary: {
            totalCases: total,
            byStatus: statusGroups.map((item) => ({
                status: item.status,
                count: item._count._all,
            })),
            byPriority: priorityGroups.map((item) => ({
                priority: item.priority,
                count: item._count._all,
            })),
            byCategory: categoryGroups.map((item) => ({
                category: item.category,
                count: item._count._all,
            })),
        },
        items: cases.map((item) => ({
            id: item.id,
            caseNumber: item.caseNumber,
            title: item.title,
            status: item.status,
            priority: item.priority,
            category: item.category,
            isEscalated: item.isEscalated,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            resolvedAt: item.resolvedAt,
            closedAt: item.closedAt,
            assignee: item.assignments[0]?.member
                ? {
                    id: item.assignments[0].member.id,
                    name: item.assignments[0].member.user.name,
                    email: item.assignments[0].member.user.email,
                }
                : null,
        })),
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
