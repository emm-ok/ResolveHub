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

  const email = getPrimaryEmail(
    user.email_addresses,
    user.primary_email_address_id
  );

  if (!email) {
    throw new Error(
      `Clerk user ${user.id} has no email address`
    );
  }

  const firstName = user.first_name ?? "";
  const lastName = user.last_name ?? "";

  const name = `${firstName} ${lastName}`.trim() ?? null;

  await prisma.user.upsert({
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
      deletedAt: null,
    },
  });
}

export async function handleUserUpdated(event: WebhookEvent) {
  if (event.type !== "user.updated") {
    return;
  }

  const user = event.data;

  const email = getPrimaryEmail(
    user.email_addresses,
    user.primary_email_address_id
  );

  if (!email) {
    throw new Error(
      `Clerk user ${user.id} has no email address`
    );
  }

  const firstName = user.first_name ?? "";
  const lastName = user.last_name ?? "";

  const name =
    `${firstName} ${lastName}`.trim() ?? null;

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
      status: "INACTIVE",
      deletedAt: new Date(),
    },
  });
}