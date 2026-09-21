import { prisma } from "../../lib/prisma.js";
import { clerkClient } from "../../lib/clerk.js";

export async function ensureUserExists(
    clerkUserId: string
) {
    const existing = await prisma.user.findUnique({
        where: {
            clerkId: clerkUserId,
        },
    });

    if (existing) {
        return existing;
    }

    const clerkUser = await clerkClient.users.getUser(clerkUserId);

    const primaryEmail =
        clerkUser.emailAddresses.find(
            (email) =>
                email.id === clerkUser.primaryEmailAddressId
        )?.emailAddress ??
        clerkUser.emailAddresses[0]?.emailAddress;

    if (!primaryEmail) {
        throw new Error(
            "Authenticated Clerk user has no email"
        );
    }

    const name =
        [
            clerkUser.firstName,
            clerkUser.lastName,
        ]
            .filter(Boolean)
            .join(" ")
            .trim() || null;

    return prisma.user.upsert({
        where: {
            clerkId: clerkUser.id,
        },

        create: {
            clerkId: clerkUser.id,
            email: primaryEmail,
            name,
            status: "ACTIVE",
        },

        update: {
            email: primaryEmail,
            name,
            deletedAt: null,
        },

        include: {
            memberships: {
                where: {
                    status: "ACTIVE",
                },

                include: {
                    company: true,

                    role: {
                        include: {
                            permissions: {
                                include: {
                                    permission: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
}