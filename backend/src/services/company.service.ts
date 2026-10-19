import { AuditAction, AuditEntity, MembershipStatus, UserStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { createCompanySchema } from "../validation/company.js";
import { seedCompanyRoles } from "./company-role.service.js";
import { seedCompanySLAPolicies } from "./sla-policy.service.js";

export class CompanyServiceError extends Error {
    constructor(
        public statusCode: number,
        message: string,
    ) {
        super(message);
        this.name = "CompanyServiceError";
    }
}

function slugify(value: string): string {
    return value
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

interface CreateCompanyOptions {
    clerkUserId: string;
}

export async function createCompany(
    rawInput: unknown,
    { clerkUserId }: CreateCompanyOptions,
) {
    const input = createCompanySchema.parse(rawInput);

    const creator = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
        select: {
            id: true,
            status: true,
        },
    });

    if (!creator || creator.status !== UserStatus.ACTIVE) {
        throw new CompanyServiceError(
            403,
            "An active ResolveHub user profile is required to create a company.",
        );
    }

    const slug = input.slug ?? slugify(input.name);

    if (slug.length < 2) {
        throw new CompanyServiceError(
            400,
            "A valid company slug could not be generated.",
        );
    }

    return prisma.$transaction(async (tx) => {
        const company = await tx.company.create({
            data: {
                name: input.name,
                slug,

                ...(input.email !== undefined && { email: input.email }),
                ...(input.phone !== undefined && { phone: input.phone }),
                ...(input.website !== undefined && { website: input.website }),
                ...(input.logoUrl !== undefined && { logoUrl: input.logoUrl }),
                ...(input.description !== undefined && { description: input.description }),
                ...(input.address !== undefined && { address: input.address }),
                ...(input.city !== undefined && { city: input.city }),
                ...(input.state !== undefined && { state: input.state }),
                ...(input.country !== undefined && { country: input.country }),
                ...(input.timezone !== undefined && { timezone: input.timezone }),
                ...(input.publicIntakeEnabled !== undefined && {
                    publicIntakeEnabled: input.publicIntakeEnabled,
                }),

                createdByUserId: creator.id,
            },
        });

        // Seeds ADMIN, AGENT, INVESTIGATOR and VIEWER only.
        await seedCompanyRoles(company.id, tx);

        // Creates default SLA policies for this company.
        await seedCompanySLAPolicies(company.id, tx);

        // The creator is an ADMIN
        const adminRole = await tx.companyRole.findUnique({
            where: {
                companyId_slug: {
                    companyId: company.id,
                    slug: "admin",
                },
            },
        });

        if (!adminRole) {
            throw new Error(
                "Company initialization failed: default ADMIN role was not created.",
            );
        }

        const membership = await tx.companyMember.create({
            data: {
                companyId: company.id,
                userId: creator.id,
                roleId: adminRole.id,
                status: MembershipStatus.ACTIVE,
            },
            include: {
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

        await tx.auditLog.create({
            data: {
                actorId: creator.id,
                companyId: company.id,
                action: AuditAction.CREATE,
                entity: AuditEntity.COMPANY,
                entityId: company.id,
                metadata: {
                    source: "company-creation",
                },
            },
        });

        return {
            company,
            membership,
        };
    });
}