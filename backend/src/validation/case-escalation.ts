import { z } from "zod";

export const escalateCaseParamsSchema = z.object({
    companyId: z.string().uuid(),
    caseId: z.string().uuid(),
});

export const escalateCaseSchema = z.object({
    reason: z.string().trim().min(3).max(1000),
});