
import {
    CaseCategory,
    CasePriority,
    CaseStatus,
} from "@prisma/client";
import { z } from "zod";

const dateString = z.string().datetime({ offset: true });

export const companyEvidenceParamsSchema = z.object({
    companyId: z.string().uuid(),
    caseId: z.string().uuid(),
    evidenceId: z.string().uuid(),
});

export const companyParamsSchema = z.object({
    companyId: z.string().uuid("Invalid company ID."),
});

export const companyReportQuerySchema = z.object({
    startDate: dateString.optional(),
    endDate: dateString.optional(),
    status: z.nativeEnum(CaseStatus).optional(),
    priority: z.nativeEnum(CasePriority).optional(),
    category: z.nativeEnum(CaseCategory).optional(),
    assignedMemberId: z.string().uuid().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(25),
}).strict().refine(
    (query) =>
        !query.startDate ||
        !query.endDate ||
        new Date(query.startDate) <= new Date(query.endDate),
    {
        message: "startDate must be earlier than or equal to endDate.",
        path: ["startDate"],
    },
);

export type CompanyReportQuery = z.infer<
    typeof companyReportQuerySchema
>;
