import type { WebhookEvent } from "@clerk/express";
import { prisma } from "../../../lib/prisma.js";

function getPrimaryEmail(
  emailAddresses: Array<{
    id: string;
    email_address: string;
  }>,
  primaryEmailId?: string | null
) {
  if (!emailAddresses?.length) {
    return null;
  }

  const primary = emailAddresses.find(
    (email) => email.id === primaryEmailId
  );

  return primary?.email_address ?? emailAddresses[0]?.email_address ?? null;
}

export async function handleUserCreated(event: WebhookEvent) {
  if (event.type !== "user.created") {
    return;
  }

  const user = event.data;

  if (!user.id) {
    return;
  }

  const email = getPrimaryEmail(
    user.email_addresses,
    user.primary_email_address_id
  );

  if (!email) {
    throw new Error(
      `Clerk user ${user.id} has no email address`
    );
  }

  const firstName = user.first_name;
  const lastName = user.last_name;

  const name = user.username?.toUpperCase() ?? email.split("@")[0]?.toUpperCase() ?? `${firstName} ${lastName}`.trim()

  await prisma.$transaction(async(tx) => {
    const newUser = await tx.user.upsert({
      where: {
        clerkId: user.id,
      },

      create: {
        clerkId: user.id,
        email,
        name,
        status: "ACTIVE",
      },

      update: {
        email,
        name,
        status: "ACTIVE",
        deletedAt: null,
      },
    });

    await tx.companyMember.create({
      data: {
        userId: newUser.id,
        companyId: "657a0d16-a76c-4f85-9569-9989ed35ffa7",
        roleId: "5fb46241-034a-408f-94fb-677620f2cbe8",
        joinedAt: new Date(),
        createdAt: new Date(),
      }
    });
  })
}

export async function handleUserUpdated(event: WebhookEvent) {
  if (event.type !== "user.updated") {
    return;
  }

  const user = event.data;

  if (!user.id) {
    return;
  }

  const email = getPrimaryEmail(
    user.email_addresses,
    user.primary_email_address_id
  );

  if (!email) {
    throw new Error(
      `Clerk user ${user.id} has no email address`
    );
  }

  const firstName = user.first_name;
  const lastName = user.last_name;

  const name = `${firstName} ${lastName}`.trim() ?? user.username?.toUpperCase() ?? email.split("@")[0]?.toUpperCase();

  await prisma.user.update({
    where: {
      clerkId: user.id,
    },

    data: {
      email,
      name,
      deletedAt: null,
    },
  });
}


export async function handleUserDeleted(
  event: Extract<WebhookEvent, { type: "user.deleted" }>
) {
  const user = event.data;

  if (!user.id) {
    return;
  }

  await prisma.user.updateMany({
    where: {
      clerkId: user.id,
    },

    data: {
      status: "SUSPENDED",
      deletedAt: new Date(),
    },
  });
}