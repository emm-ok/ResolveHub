import {
    CasePriority,
    Prisma,
} from "@prisma/client";

import { prisma } from "../lib/prisma.js";

const DEFAULT_SLA_POLICIES = [
    {
        name: "Low Priority",
        priority: CasePriority.LOW,
        firstResponseMinutes: 24 * 60,
        resolutionMinutes: 120 * 60,
    },
    {
        name: "Normal Priority",
        priority: CasePriority.NORMAL,
        firstResponseMinutes: 8 * 60,
        resolutionMinutes: 72 * 60,
    },
    {
        name: "High Priority",
        priority: CasePriority.HIGH,
        firstResponseMinutes: 2 * 60,
        resolutionMinutes: 24 * 60,
    },
    {
        name: "Urgent Priority",
        priority: CasePriority.URGENT,
        firstResponseMinutes: 30,
        resolutionMinutes: 4 * 60,
    },
] as const;

/**
 * Creates the default SLA policies for a company.
 *
 * Safe to call repeatedly: existing policies with the same
 * companyId + name are not duplicated.
 */
export async function seedCompanySLAPolicies(
    companyId: string,
    tx: Prisma.TransactionClient | typeof prisma = prisma,
) {
    for (const policy of DEFAULT_SLA_POLICIES) {
        await tx.sLAPolicy.upsert({
            where: {
                companyId_name: {
                    companyId,
                    name: policy.name,
                },
            },
            update: {},
            create: {
                companyId,
                ...policy,
                isDefault: true,
                isActive: true,
            },
        });
    }
}