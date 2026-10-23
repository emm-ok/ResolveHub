import { prisma } from "../../lib/prisma.js";
import { clerkClient } from "../../lib/clerk.js";
import { ServiceError } from "../../services/case-management.service.js";

const userProfileSelect = {
    id: true,
    clerkId: true,
    email: true,
    name: true,
    status: true,
    platformRole: true,

    memberships: {
        where: {
            status: "ACTIVE" as const,
            company: {
                status: "ACTIVE" as const,
                deletedAt: null,
            },
        },
        select: {
            id: true,
            companyId: true,
            status: true,
            department: true,
            jobTitle: true,

            company: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    logoUrl: true,
                },
            },

            role: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    systemRole: true,
                    permissions: {
                        select: {
                            permission: {
                                select: {
                                    code: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    },
} as const;

export async function ensureUserExists(clerkUserId: string) {
    const existingUser = await prisma.user.findUnique({
        where: {
            clerkId: clerkUserId,
        },
        select: userProfileSelect,
    });

    if (existingUser) {
        if (existingUser.status !== "ACTIVE") {
            throw new ServiceError(
                403,
                "Your account is not active.",
            );
        }

        return existingUser;
    }

    // Only fetch Clerk's profile when a local user record is missing.
    const clerkUser = await clerkClient.users.getUser(clerkUserId);

    const primaryEmail = clerkUser.emailAddresses.find(
        (email) => email.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress;

    if (!primaryEmail) {
        throw new ServiceError(
            400,
            "Your Clerk account does not have a primary email address.",
        );
    }

    const name =
        [clerkUser.firstName, clerkUser.lastName]
            .filter(Boolean)
            .join(" ")
            .trim() || null;

    // Upsert protects against two simultaneous first requests
    // attempting to create the same local user.
    const user = await prisma.user.upsert({
        where: {
            clerkId: clerkUser.id,
        },
        create: {
            clerkId: clerkUser.id,
            email: primaryEmail,
            name,
            status: "ACTIVE",
        },
        update: {},
        select: userProfileSelect,
    });

    if (user.status !== "ACTIVE") {
        throw new ServiceError(
            403,
            "Your account is not active.",
        );
    }

    return user;
}