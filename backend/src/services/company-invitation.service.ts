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
import type { sendCompanyInvitationSchema } from "../validation/company-invitation.js";
import { requireCompanyPermission } from "../middleware/authorization.js";

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