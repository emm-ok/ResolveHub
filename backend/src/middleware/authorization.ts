
import { MembershipStatus, UserStatus, type PermissionCode } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export class AuthorizationError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number = 403,
    ) {
        super(message);
        this.name = "AuthorizationError";
    }
}

interface AuthorizationInput {
    clerkUserId: string;
    companyId: string;
    permission: PermissionCode;
}

export async function requireCompanyPermission({
    clerkUserId,
    companyId,
    permission,
}: AuthorizationInput) {
    const user = await prisma.user.findUnique({
        where: {
            clerkId: clerkUserId,
        },

        select: {
            id: true,
            status: true,
        },
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
        throw new AuthorizationError(
            "Authentication required.",
            401,
        );
    }

    const membership = await prisma.companyMember.findFirst({
        where: {
            userId: user.id,
            companyId,
            status: MembershipStatus.ACTIVE,

            company: {
                status: "ACTIVE",
                deletedAt: null,
            },

            role: {
                permissions: {
                    some: {
                        permission: {
                            code: permission,
                        },
                    },
                },
            },
        },

        select: {
            id: true,
            userId: true,
            companyId: true,
            roleId: true,

            role: {
                select: {
                    id: true,
                    name: true,
                    systemRole: true,
                },
            },
        },
    });

    if (!membership) {
        throw new AuthorizationError(
            "You do not have permission to perform this action.",
            403,
        );
    }

    return {
        userId: user.id,
        membershipId: membership.id,
        companyId: membership.companyId,
        roleId: membership.roleId,
        role: membership.role,
    };
}