import { z } from "zod";
import { AuditAction, AuditEntity, CompanyStatus } from "@prisma/client";

export const reactivateCompanyParamsSchema = z.object({
    companyId: z.string().uuid("Invalid company ID."),
});

export const auditLogsQuerySchema = z.object({
    companyId: z.string().uuid().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    action: z.nativeEnum(AuditAction).optional(),
    entity: z.nativeEnum(AuditEntity).optional(),
    entityId: z.string().uuid().optional(),
});

export const allCompaniesQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(150).optional(),
    status: z.nativeEnum(CompanyStatus).optional(),
});

export type AuditLogsQuery = z.infer<typeof auditLogsQuerySchema>;
export type AllCompaniesQuery = z.infer<typeof allCompaniesQuerySchema>;