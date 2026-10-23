
import {
    AuditAction,
    AuditEntity,
    CompanyStatus,
    MembershipStatus,
    PermissionCode,
} from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { ServiceError } from "./case-management.service.js";
import type {
    CompanyMemberListQuery,
    UpdateCompanyMemberInput,
} from "../validation/company-member.js";
import { requireCompanyPermission } from "../middleware/authorization.js";

export async function ensureActiveCompany(companyId: string) {
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



/**
 * GET /companies/:companyId/members
 * Returns minimal member and role information for a frontend table.
 */
export async function getCompanyMembersService({
    clerkUserId,
    companyId,
    query,
}: {
    clerkUserId: string;
    companyId: string;
    query: CompanyMemberListQuery;
}) {
    await requireCompanyPermission({
        clerkUserId, 
        companyId, 
        permission: PermissionCode.MEMBER_READ
    });

    await ensureActiveCompany(companyId);

    const { page, limit, search, status, roleId } = query;

    const where = {
        companyId,
        ...(status ? { status } : {}),
        ...(roleId ? { roleId } : {}),
        ...(search
            ? {
                user: {
                    OR: [
                        {
                            name: {
                                contains: search,
                                mode: "insensitive" as const,
                            },
                        },
                        {
                            email: {
                                contains: search,
                                mode: "insensitive" as const,
                            },
                        },
                    ],
                },
            }
            : {}),
    };

    const [total, members] = await prisma.$transaction([
        prisma.companyMember.count({ where }),
        prisma.companyMember.findMany({
            where,
            orderBy: [{ createdAt: "desc" }, { id: "asc" }],
            skip: (page - 1) * limit,
            take: limit,
            select: {
                id: true,
                status: true,
                department: true,
                jobTitle: true,
                employeeId: true,
                joinedAt: true,
                suspendedAt: true,
                removedAt: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                role: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        systemRole: true,
                    },
                },
            },
        }),
    ]);

    return {
        items: members.map((member) => ({
            id: member.id,
            status: member.status,
            department: member.department,
            jobTitle: member.jobTitle,
            employeeId: member.employeeId,
            joinedAt: member.joinedAt,
            suspendedAt: member.suspendedAt,
            removedAt: member.removedAt,
            user: member.user,
            role: member.role,
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

/**
 * PATCH /companies/:companyId/members/:memberId
 * Updates a member's role, employment details, or active/suspended state.
 */
export async function updateCompanyMemberService({
    clerkUserId,
    companyId,
    memberId,
    input,
}: {
    clerkUserId: string;
    companyId: string;
    memberId: string;
    input: UpdateCompanyMemberInput;
}) {
    const actor = await requireCompanyPermission({
        clerkUserId,
        companyId,
        permission: PermissionCode.MEMBER_UPDATE,
    });

    await ensureActiveCompany(companyId);

    const target = await prisma.companyMember.findFirst({
        where: { id: memberId, companyId },
        select: {
            id: true,
            userId: true,
            roleId: true,
            status: true,
            employeeId: true,
            department: true,
            jobTitle: true,
            role: {
                select: {
                    systemRole: true,
                },
            },
        },
    });

    if (!target) {
        throw new ServiceError(404, "Company member not found.");
    }

    if (target.status === MembershipStatus.REMOVED) {
        throw new ServiceError(
            409,
            "A removed member cannot be edited. Send a new invitation instead.",
        );
    }

    if (input.roleId) {
        const role = await prisma.companyRole.findFirst({
            where: {
                id: input.roleId,
                companyId,
            },
            select: {
                id: true,
                systemRole: true,
            },
        });

        if (!role) {
            throw new ServiceError(400, "The selected role is invalid for this company.");
        }

        // Do not allow a caller to demote or suspend themselves.
        if (
            target.userId === actor.userId &&
            (input.roleId !== target.roleId ||
                input.status === MembershipStatus.SUSPENDED)
        ) {
            throw new ServiceError(
                409,
                "You cannot change your own role or suspend your own membership.",
            );
        }

        // Keep at least one active administrator.
        const removesAdminPrivileges =
            target.role.systemRole === "ADMIN" &&
            role.systemRole !== "ADMIN";

        if (
            removesAdminPrivileges ||
            (target.role.systemRole === "ADMIN" &&
                input.status === MembershipStatus.SUSPENDED)
        ) {
            const activeAdminCount = await prisma.companyMember.count({
                where: {
                    companyId,
                    status: MembershipStatus.ACTIVE,
                    role: { systemRole: "ADMIN" },
                },
            });

            if (activeAdminCount <= 1) {
                throw new ServiceError(
                    409,
                    "The company's last active administrator cannot be demoted or suspended.",
                );
            }
        }
    }

    if (
        input.status === MembershipStatus.SUSPENDED &&
        target.userId === actor.userId
    ) {
        throw new ServiceError(409, "You cannot suspend your own membership.");
    }

    const nextEmployeeId =
        input.employeeId === undefined
            ? target.employeeId
            : input.employeeId;

    if (nextEmployeeId) {
        const duplicate = await prisma.companyMember.findFirst({
            where: {
                companyId,
                employeeId: nextEmployeeId,
                status: MembershipStatus.ACTIVE,
                id: { not: memberId },
            },
            select: { id: true },
        });

        if (duplicate) {
            throw new ServiceError(
                409,
                "This employee ID is already assigned to another active member.",
            );
        }
    }

    const nextStatus = input.status as MembershipStatus | undefined;

    const updated = await prisma.$transaction(async (tx) => {
        const data = {
            ...(input.roleId !== undefined ? { roleId: input.roleId } : {}),
            ...(input.department !== undefined
                ? { department: input.department }
                : {}),
            ...(input.jobTitle !== undefined ? { jobTitle: input.jobTitle } : {}),
            ...(input.employeeId !== undefined
                ? { employeeId: input.employeeId }
                : {}),
            ...(nextStatus !== undefined
                ? {
                    status: nextStatus,
                    suspendedAt:
                        nextStatus === MembershipStatus.SUSPENDED
                            ? new Date()
                            : null,
                }
                : {}),
        };

        const membership = await tx.companyMember.update({
            where: { id: memberId },
            data,
            select: {
                id: true,
                status: true,
                department: true,
                jobTitle: true,
                employeeId: true,
                joinedAt: true,
                suspendedAt: true,
                removedAt: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
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

        const roleChanged =
            input.roleId !== undefined && input.roleId !== target.roleId;

        const statusChanged =
            nextStatus !== undefined && nextStatus !== target.status;

        const action = roleChanged
            ? AuditAction.ROLE_CHANGED
            : statusChanged && nextStatus === MembershipStatus.SUSPENDED
                ? AuditAction.MEMBER_SUSPENDED
                : statusChanged && nextStatus === MembershipStatus.ACTIVE
                    ? AuditAction.MEMBER_REACTIVATED
                    : AuditAction.UPDATE;

        await tx.auditLog.create({
            data: {
                actorId: actor.userId,
                companyId,
                action,
                entity: AuditEntity.MEMBERSHIP,
                entityId: memberId,
                metadata: {
                    changedFields: Object.keys(input),
                    previousRoleId: target.roleId,
                    newRoleId: membership.role.id,
                    previousStatus: target.status,
                    newStatus: membership.status,
                },
            },
        });

        return membership;
    });

    return updated;
}

/**
 * DELETE /companies/:companyId/members/:memberId
 * Soft-removes the member, preserving history and foreign-key references.
 */
export async function removeCompanyMemberService({
    clerkUserId,
    companyId,
    memberId,
}: {
    clerkUserId: string;
    companyId: string;
    memberId: string;
}) {
    const actor = await requireCompanyPermission({
        clerkUserId,
        companyId,
        permission: PermissionCode.MEMBER_REMOVE,
    });

    await ensureActiveCompany(companyId);

    const target = await prisma.companyMember.findFirst({
        where: { id: memberId, companyId },
        select: {
            id: true,
            userId: true,
            status: true,
            roleId: true,
            role: {
                select: {
                    systemRole: true,
                    name: true,
                },
            },
        },
    });

    if (!target) {
        throw new ServiceError(404, "Company member not found.");
    }

    if (target.status === MembershipStatus.REMOVED) {
        throw new ServiceError(409, "This member has already been removed.");
    }

    if (target.userId === actor.userId) {
        throw new ServiceError(
            409,
            "You cannot remove your own company membership.",
        );
    }

    if (
        target.status === MembershipStatus.ACTIVE &&
        target.role.systemRole === "ADMIN"
    ) {
        const activeAdminCount = await prisma.companyMember.count({
            where: {
                companyId,
                status: MembershipStatus.ACTIVE,
                role: { systemRole: "ADMIN" },
            },
        });

        if (activeAdminCount <= 1) {
            throw new ServiceError(
                409,
                "The company's last active administrator cannot be removed.",
            );
        }
    }

    return prisma.$transaction(async (tx) => {
        const removedAt = new Date();

        const membership = await tx.companyMember.update({
            where: { id: memberId },
            data: {
                status: MembershipStatus.REMOVED,
                removedAt,
            },
            select: {
                id: true,
                companyId: true,
                status: true,
                removedAt: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        await tx.caseAssignment.updateMany({
            where: {
                memberId: membership.id,
                unassignedAt: null,
            },
            data: {
                unassignedAt: removedAt,
                note: "Automatically unassigned because the member was removed.",
            },
        });

        await tx.auditLog.create({
            data: {
                actorId: actor.userId,
                companyId,
                action: AuditAction.MEMBER_REMOVED,
                entity: AuditEntity.MEMBERSHIP,
                entityId: memberId,
                metadata: {
                    removedUserId: target.userId,
                    previousRoleId: target.roleId,
                    previousRoleName: target.role.name,
                },
            },
        });

        return membership;
    });
}
