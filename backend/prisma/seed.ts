import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PermissionCode, PrismaClient } from "@prisma/client"

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
}

const adapter = new PrismaPg({
    connectionString,
});

const prisma = new PrismaClient({
    adapter,
});


const PERMISSION_DEFINITIONS: Record<
    PermissionCode,
    {
        name: string;
        description: string;
    }
> = {
    USER_READ: {
        name: "Read users",
        description: "View authorized user information.",
    },

    USER_UPDATE: {
        name: "Update users",
        description: "Update authorized user information.",
    },

    COMPANY_SETTINGS_READ: {
        name: "Read company settings",
        description: "View organization settings.",
    },

    COMPANY_SETTINGS_UPDATE: {
        name: "Update company settings",
        description: "Modify organization settings.",
    },

    MEMBER_READ: {
        name: "Read members",
        description: "View company membership records.",
    },

    MEMBER_INVITE: {
        name: "Invite members",
        description: "Invite users to join a company.",
    },

    MEMBER_UPDATE: {
        name: "Update members",
        description: "Update company member details and roles.",
    },

    MEMBER_REMOVE: {
        name: "Remove members",
        description: "Remove company members.",
    },

    ROLE_READ: {
        name: "Read roles",
        description: "View company roles and their permissions.",
    },

    ROLE_MANAGE: {
        name: "Manage roles",
        description: "Create and modify company roles and permissions.",
    },

    CASE_REQUEST_READ: {
        name: "Read case requests",
        description: "View customer submissions belonging to the company.",
    },

    CASE_REQUEST_REVIEW: {
        name: "Review case requests",
        description: "Review and decide incoming customer submissions.",
    },

    CASE_CREATE: {
        name: "Create cases",
        description: "Create operational cases.",
    },

    CASE_READ: {
        name: "Read cases",
        description: "View authorized company cases.",
    },

    CASE_UPDATE: {
        name: "Update cases",
        description: "Modify case details and permitted workflow fields.",
    },

    CASE_ASSIGN: {
        name: "Assign cases",
        description: "Assign or reassign company members to cases.",
    },

    CASE_ESCALATE: {
        name: "Escalate cases",
        description: "Escalate cases requiring additional attention.",
    },

    CASE_RESOLVE: {
        name: "Resolve cases",
        description: "Mark cases as resolved.",
    },

    CASE_CLOSE: {
        name: "Close cases",
        description: "Close resolved cases.",
    },

    CASE_REOPEN: {
        name: "Reopen cases",
        description: "Reopen previously closed cases.",
    },

    COMMENT_CREATE: {
        name: "Create comments",
        description: "Add comments to authorized cases.",
    },

    EVIDENCE_READ: {
        name: "Read evidence",
        description: "View authorized evidence metadata and files.",
    },

    EVIDENCE_UPLOAD: {
        name: "Upload evidence",
        description: "Upload evidence to authorized requests or cases.",
    },

    EVIDENCE_DELETE: {
        name: "Delete evidence",
        description: "Remove evidence when permitted by retention policy.",
    },

    RESOLUTION_PROPOSE: {
        name: "Propose resolutions",
        description: "Submit a proposed case resolution.",
    },

    RESOLUTION_DECIDE: {
        name: "Decide resolutions",
        description: "Accept or reject proposed resolutions.",
    },

    SLA_MANAGE: {
        name: "Manage SLA policies",
        description: "Create and manage company service-level policies.",
    },

    AUDIT_READ: {
        name: "Read audit logs",
        description: "View authorized audit history.",
    },
};


async function seedPermissions() {
    const codes = Object.values(PermissionCode);

    for (const code of codes) {
        const definition = PERMISSION_DEFINITIONS[code]

        await prisma.permission.upsert({
            where: { code },

            update: {
                name: definition.name,
                description: definition.description,
            },

            create: {
                code,
                name: definition.name,
                description: definition.description,
            },
        });
    }

    console.log(`Seeded ${codes.length} permission definitions.`);
}


async function main() {
    await seedPermissions();

    console.log("ResolveHub permission seeding completed.");
}

main()
    .catch((error) => {
        console.error("Seeding failed:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    })