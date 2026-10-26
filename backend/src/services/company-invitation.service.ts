import {
    AuditAction,
    AuditEntity,
    CompanyStatus,
    InvitationStatus,
    MembershipStatus,
    PermissionCode,
    UserStatus,
} from "@prisma/client";
import { createHash, randomBytes } from "node:crypto";

import { prisma } from "../lib/prisma.js";
import { ServiceError } from "./case-management.service.js";
import { sendCompanyInvitationEmail } from "./email.service.js";

import type { z } from "zod";
import type { CompanyInvitationListQuery, sendCompanyInvitationSchema } from "../validation/company-invitation.js";
import { requireCompanyPermission } from "../middleware/authorization.js";
import { clerkClient } from "../lib/clerk.js";
import { ensureActiveCompany } from "./company-member.service.js";

type SendInvitationInput = {
    clerkUserId: string;
    companyId: string;
    input: z.infer<typeof sendCompanyInvitationSchema>;
};

const INVITATION_EXPIRY_DAYS = 7;

export async function sendCompanyInvitationService({
    clerkUserId,
    companyId,
    input,
}: SendInvitationInput) {
    const actor = await requireCompanyPermission({
        clerkUserId,
        companyId,
        permission: PermissionCode.MEMBER_INVITE,
    });

    const inviter = await prisma.user.findFirst({
        where: {
            id: actor.userId,
        },
        select: {
            name: true,
        }
    })

    if(!inviter) {
        throw new ServiceError(404, "Inviter not found")
    }

    const email = input.email.trim().toLowerCase();
    const now = new Date();

    const [company, role, existingUser] = await Promise.all([
        prisma.company.findFirst({
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
        }),
        prisma.companyRole.findFirst({
            where: {
                id: input.roleId,
                companyId,
            },
            select: {
                id: true,
                name: true,
                slug: true,
            },
        }),
        prisma.user.findFirst({
            where: {
                email: { equals: email, mode: "insensitive" },
            },
            select: {
                id: true,
                status: true,
            },
        }),
    ]);

    if (!company) {
        throw new ServiceError(404, "Company not found.");
    }

    if (!role) {
        throw new ServiceError(
            400,
            "The selected role does not belong to this company.",
        );
    }

    if (existingUser?.status === UserStatus.ACTIVE) {
        const existingMembership = await prisma.companyMember.findFirst({
            where: {
                companyId,
                userId: existingUser.id,
                status: MembershipStatus.ACTIVE,
            },
            select: { id: true },
        });

        if (existingMembership) {
            throw new ServiceError(
                409,
                "This person is already an active company member.",
            );
        }
    }

    if (input.employeeId) {
        const employeeExists = await prisma.companyMember.findFirst({
            where: {
                companyId,
                employeeId: input.employeeId,
                status: MembershipStatus.ACTIVE,
            },
            select: { id: true },
        });

        if (employeeExists) {
            throw new ServiceError(
                409,
                "This employee ID is already assigned in this company.",
            );
        }
    }

    // Revoke expired pending invitations before checking for a duplicate.
    await prisma.companyInvitation.updateMany({
        where: {
            companyId,
            email,
            status: InvitationStatus.PENDING,
            expiresAt: { lte: now },
        },
        data: { status: InvitationStatus.EXPIRED },
    });

    const pendingInvitation = await prisma.companyInvitation.findFirst({
        where: {
            companyId,
            email,
            status: InvitationStatus.PENDING,
            expiresAt: { gt: now },
        },
        select: { id: true },
    });

    if (pendingInvitation) {
        throw new ServiceError(
            409,
            "A pending invitation already exists for this email.",
        );
    }

    // The raw token is sent to the invitee. Only its hash is stored.
    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(
        now.getTime() + INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    );

    const invitation = await prisma.$transaction(async (tx) => {
        const created = await tx.companyInvitation.create({
            data: {
                companyId,
                roleId: role.id,
                invitedByMemberId: actor.membershipId,
                email,
                tokenHash,
                status: InvitationStatus.PENDING,
                department: input.department ?? null,
                jobTitle: input.jobTitle ?? null,
                employeeId: input.employeeId ?? null,
                expiresAt,
            },
            select: {
                id: true,
                email: true,
                status: true,
                expiresAt: true,
                createdAt: true,
            },
        });

        await tx.auditLog.create({
            data: {
                actorId: actor.userId,
                companyId,
                action: AuditAction.INVITE,
                entity: AuditEntity.INVITATION,
                entityId: created.id,
                metadata: {
                    email,
                    roleId: role.id,
                    roleName: role.name,
                    expiresAt: expiresAt.toISOString(),
                },
            },
        });

        return created;
    });

    const appUrl = process.env.APP_URL;

    if (!appUrl) {
        // Do not leave an unusable invitation pending.
        await prisma.companyInvitation.update({
            where: { id: invitation.id },
            data: { status: InvitationStatus.REVOKED, revokedAt: new Date() },
        });

        throw new ServiceError(
            500,
            "Invitation delivery is not configured.",
        );
    }

    const invitationUrl =
        `${appUrl.replace(/\/$/, "")}/accept-invitation` +
        `?token=${encodeURIComponent(token)}`;

    try {
        await sendCompanyInvitationEmail({
            to: email,
            companyName: company.name,
            roleName: role.name,
            invitationUrl,
            expiresAt,
            inviterName: inviter.name ?? "Inviter",
        });
    } catch {
        // Avoid leaving a pending invitation that the recipient never received.
        await prisma.companyInvitation.updateMany({
            where: {
                id: invitation.id,
                status: InvitationStatus.PENDING,
            },
            data: {
                status: InvitationStatus.REVOKED,
                revokedAt: new Date(),
            },
        });

        throw new ServiceError(
            502,
            "The invitation could not be delivered. Please try again.",
        );
    }

    return {
        ...invitation,
        company: {
            id: company.id,
            name: company.name,
        },
        role: {
            id: role.id,
            name: role.name,
        },
    };
}


/**
 * GET /companies/:companyId/invitations
 * Returns only fields needed for an invitations table.
 */
export async function getCompanyInvitationsService({
    clerkUserId,
    companyId,
    query,
}: {
    clerkUserId: string;
    companyId: string;
    query: CompanyInvitationListQuery;
}) {
    await requireCompanyPermission({
        clerkUserId, 
        companyId, 
        permission: PermissionCode.MEMBER_READ
    });
    await ensureActiveCompany(companyId);

    const { page, limit, search, status } = query;

    const where = {
        companyId,
        ...(status ? { status } : {}),
        ...(search
            ? {
                email: {
                    contains: search,
                    mode: "insensitive" as const,
                },
            }
            : {}),
    };

    const [total, invitations] = await prisma.$transaction([
        prisma.companyInvitation.count({ where }),
        prisma.companyInvitation.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
            select: {
                id: true,
                email: true,
                status: true,
                department: true,
                jobTitle: true,
                employeeId: true,
                expiresAt: true,
                acceptedAt: true,
                revokedAt: true,
                createdAt: true,
                role: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
        }),
    ]);

    // Reflect expired pending invitations even if a scheduled cleanup has
    // not run yet. This update does not expose tokenHash.
    const now = new Date();
    const expiredIds = invitations
        .filter(
            (invitation) =>
                invitation.status === InvitationStatus.PENDING &&
                invitation.expiresAt <= now,
        )
        .map((invitation) => invitation.id);

    if (expiredIds.length > 0) {
        await prisma.companyInvitation.updateMany({
            where: {
                id: { in: expiredIds },
                companyId,
                status: InvitationStatus.PENDING,
                expiresAt: { lte: now },
            },
            data: { status: InvitationStatus.EXPIRED },
        });
    }

    const data = invitations.map((invitation) => ({
        ...invitation,
        status: expiredIds.includes(invitation.id)
            ? InvitationStatus.EXPIRED
            : invitation.status,
    }));

    return {
        items: data,
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

// Adjust the helper import path to match your project structure.

function hashInvitationToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}

/**
 * Returns invitation details without exposing tokenHash.
 * Requires the caller to have MEMBER_READ for the company.
 */
export async function getCompanyInvitationService({
    clerkUserId,
    companyId,
    invitationId,
}: {
    clerkUserId: string;
    companyId: string;
    invitationId: string;
}) {
    await requireCompanyPermission({
        clerkUserId,
        companyId,
        permission: PermissionCode.MEMBER_READ,
    });

    const invitation = await prisma.companyInvitation.findFirst({
        where: {
            id: invitationId,
            companyId,
            company: {
                status: CompanyStatus.ACTIVE,
                deletedAt: null,
            },
        },
        select: {
            id: true,
            email: true,
            status: true,
            department: true,
            jobTitle: true,
            employeeId: true,
            expiresAt: true,
            acceptedAt: true,
            revokedAt: true,
            createdAt: true,
            updatedAt: true,
            company: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
            role: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    description: true,
                    systemRole: true,
                },
            },
            invitedByMember: {
                select: {
                    id: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
            acceptedBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });

    if (!invitation) {
        throw new ServiceError(404, "Invitation not found.");
    }

    // Reflect expiration even if no background expiry job has run.
    if (
        invitation.status === InvitationStatus.PENDING &&
        invitation.expiresAt <= new Date()
    ) {
        await prisma.companyInvitation.updateMany({
            where: {
                id: invitation.id,
                status: InvitationStatus.PENDING,
                expiresAt: { lte: new Date() },
            },
            data: { status: InvitationStatus.EXPIRED },
        });

        return {
            ...invitation,
            status: InvitationStatus.EXPIRED,
        };
    }

    return invitation;
}

/**
 * Accepts an invitation for the currently authenticated Clerk user.
 *
 * The raw token is never persisted. Membership creation/reactivation,
 * invitation acceptance, and audit logging happen in one transaction.
 */
export async function acceptCompanyInvitationService({
    clerkUserId,
    token,
}: {
    clerkUserId: string;
    token: string;
}) {
    const normalizedToken = token.trim();
    const tokenHash = hashInvitationToken(normalizedToken);

    // Verify the current Clerk identity and its primary email.
    const clerkUser = await clerkClient.users.getUser(clerkUserId);

    const primaryEmail = clerkUser.emailAddresses.find(
        (email) => email.id === clerkUser.primaryEmailAddressId,
    );

    if (
        !primaryEmail ||
        primaryEmail.verification?.status !== "verified"
    ) {
        throw new ServiceError(
            403,
            "A verified primary email address is required to accept an invitation.",
        );
    }

    const verifiedEmail = primaryEmail.emailAddress.trim().toLowerCase();

    const dbUser = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
        select: {
            id: true,
            status: true,
        },
    });

    if (!dbUser || dbUser.status !== UserStatus.ACTIVE) {
        throw new ServiceError(401, "Your account is not active.");
    }

    // Initial lookup gives a useful response before acquiring the row lock.
    const candidate = await prisma.companyInvitation.findUnique({
        where: { tokenHash },
        select: {
            id: true,
            companyId: true,
            email: true,
            status: true,
            expiresAt: true,
        },
    });

    if (!candidate) {
        throw new ServiceError(404, "Invitation is invalid or no longer available.");
    }

    if (candidate.email.trim().toLowerCase() !== verifiedEmail) {
        throw new ServiceError(
            403,
            "Your verified email address does not match this invitation.",
        );
    }

    return prisma.$transaction(async (tx) => {
        // Prevent two simultaneous requests from accepting the same invitation.
        await tx.$queryRaw<{ id: string }[]>`
      SELECT id
      FROM "CompanyInvitation"
      WHERE id = ${candidate.id}::uuid
      FOR UPDATE
    `;

        const invitation = await tx.companyInvitation.findUnique({
            where: { id: candidate.id },
            select: {
                id: true,
                companyId: true,
                roleId: true,
                email: true,
                status: true,
                expiresAt: true,
                department: true,
                jobTitle: true,
                employeeId: true,
                company: {
                    select: {
                        id: true,
                        name: true,
                        status: true,
                        deletedAt: true,
                    },
                },
                role: {
                    select: {
                        id: true,
                        name: true,
                        companyId: true,
                    },
                },
            },
        });

        if (!invitation) {
            throw new ServiceError(404, "Invitation not found.");
        }

        if (invitation.status !== InvitationStatus.PENDING) {
            throw new ServiceError(
                409,
                `This invitation cannot be accepted because its status is ${invitation.status}.`,
            );
        }

        if (invitation.expiresAt <= new Date()) {
            await tx.companyInvitation.update({
                where: { id: invitation.id },
                data: { status: InvitationStatus.EXPIRED },
            });

            throw new ServiceError(410, "This invitation has expired.");
        }

        if (
            invitation.company.status !== CompanyStatus.ACTIVE ||
            invitation.company.deletedAt
        ) {
            throw new ServiceError(
                409,
                "This company is not currently accepting invitations.",
            );
        }

        if (
            invitation.role.companyId !== invitation.companyId
        ) {
            throw new ServiceError(
                409,
                "The invitation role is no longer valid for this company.",
            );
        }

        // Re-check identity-bound data while processing the invitation.
        if (
            invitation.email.trim().toLowerCase() !== verifiedEmail
        ) {
            throw new ServiceError(
                403,
                "Your verified email address does not match this invitation.",
            );
        }

        // employeeId is optional, but when supplied it must not belong
        // to another active member of this company.
        if (invitation.employeeId) {
            const employeeIdInUse = await tx.companyMember.findFirst({
                where: {
                    companyId: invitation.companyId,
                    employeeId: invitation.employeeId,
                    status: MembershipStatus.ACTIVE,
                    userId: { not: dbUser.id },
                },
                select: { id: true },
            });

            if (employeeIdInUse) {
                throw new ServiceError(
                    409,
                    "This employee ID is already assigned to another active member.",
                );
            }
        }

        const existingMembership = await tx.companyMember.findUnique({
            where: {
                userId_companyId: {
                    userId: dbUser.id,
                    companyId: invitation.companyId,
                },
            },
            select: {
                id: true,
                status: true,
            },
        });

        if (existingMembership?.status === MembershipStatus.ACTIVE) {
            throw new ServiceError(
                409,
                "You are already an active member of this company.",
            );
        }

        const membership = existingMembership
            ? await tx.companyMember.update({
                where: { id: existingMembership.id },
                data: {
                    roleId: invitation.roleId,
                    status: MembershipStatus.ACTIVE,
                    department: invitation.department,
                    jobTitle: invitation.jobTitle,
                    employeeId: invitation.employeeId,
                    joinedAt: new Date(),
                    suspendedAt: null,
                    removedAt: null,
                },
                select: {
                    id: true,
                    companyId: true,
                    roleId: true,
                    status: true,
                    department: true,
                    jobTitle: true,
                    employeeId: true,
                    joinedAt: true,
                },
            })
            : await tx.companyMember.create({
                data: {
                    userId: dbUser.id,
                    companyId: invitation.companyId,
                    roleId: invitation.roleId,
                    status: MembershipStatus.ACTIVE,
                    department: invitation.department,
                    jobTitle: invitation.jobTitle,
                    employeeId: invitation.employeeId,
                    joinedAt: new Date(),
                },
                select: {
                    id: true,
                    companyId: true,
                    roleId: true,
                    status: true,
                    department: true,
                    jobTitle: true,
                    employeeId: true,
                    joinedAt: true,
                },
            });

        await tx.companyInvitation.update({
            where: { id: invitation.id },
            data: {
                status: InvitationStatus.ACCEPTED,
                acceptedAt: new Date(),
                acceptedByUserId: dbUser.id,
            },
        });

        await tx.auditLog.create({
            data: {
                actorId: dbUser.id,
                companyId: invitation.companyId,
                action: AuditAction.INVITATION_ACCEPTED,
                entity: AuditEntity.INVITATION,
                entityId: invitation.id,
                metadata: {
                    membershipId: membership.id,
                    roleId: membership.roleId,
                },
            },
        });

        return {
            invitation: {
                id: invitation.id,
                status: InvitationStatus.ACCEPTED,
                acceptedAt: new Date(),
            },
            membership,
            company: {
                id: invitation.company.id,
                name: invitation.company.name,
            },
        };
    });
}
