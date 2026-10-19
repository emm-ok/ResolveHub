import type { Prisma, SystemRoleType } from "@prisma/client";
import { ROLE_PERMISSIONS } from "../permissions/role-permissions.js";
import { prisma } from "../lib/prisma.js";

const DEFAULT_ROLES: {
    type: SystemRoleType;
    name: string;
    slug: string;
    description: string;
    isDefault: boolean;
}[] = [
        {
            type: "ADMIN",
            name: "Administrator",
            slug: "admin",
            description: "Manage company operations, members, and cases.",
            isDefault: false,
        },

        {
            type: "AGENT",
            name: "Agent",
            slug: "agent",
            description: "Handle assigned cases and customer communication.",
            isDefault: true,
        },

        {
            type: "INVESTIGATOR",
            name: "Investigator",
            slug: "investigator",
            description: "Investigate cases and submit resolution proposals.",
            isDefault: false,
        },

        {
            type: "VIEWER",
            name: "Viewer",
            slug: "viewer",
            description: "Read authorized case and request information.",
            isDefault: false,
        },
    ];

export async function seedCompanyRoles(
    companyId: string,
    tx: Prisma.TransactionClient | typeof prisma = prisma,
) {
    const permissions = await tx.permission.findMany();

    const permissionByCode = new Map(
        permissions.map((permission) => [
            permission.code,
            permission.id,
        ]),
    );

    for (const roleDefinition of DEFAULT_ROLES) {
        const role = await tx.companyRole.upsert({
            where: {
                companyId_slug: {
                    companyId,
                    slug: roleDefinition.slug,
                },
            },

            update: {
                name: roleDefinition.name,
                description: roleDefinition.description,
                systemRole: roleDefinition.type,
            },

            create: {
                companyId,
                name: roleDefinition.name,
                slug: roleDefinition.slug,
                description: roleDefinition.description,
                systemRole: roleDefinition.type,
                isDefault: roleDefinition.isDefault,
            },
        });

        const requiredPermissions =
            ROLE_PERMISSIONS[roleDefinition.type];

        for (const code of requiredPermissions) {
            const permissionId = permissionByCode.get(code);

            if (!permissionId) {
                throw new Error(
                    `Permission ${code} has not been seeded.`,
                );
            }

            await tx.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: role.id,
                        permissionId,
                    },
                },

                update: {},

                create: {
                    roleId: role.id,
                    permissionId,
                },
            });
        }
    }
}