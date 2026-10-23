import { InvitationStatus } from "@prisma/client";
import { z } from "zod";

export const sendCompanyInvitationSchema = z.object({
    email: z.string().trim().email().max(254),
    roleId: z.string().uuid(),
    department: z.string().trim().max(100).optional(),
    jobTitle: z.string().trim().max(100).optional(),
    employeeId: z.string().trim().max(100).optional(),
});

export const invitationParamsSchema = z.object({
    companyId: z.string().uuid(),
});


export const invitationDetailsParamsSchema = z.object({
    companyId: z.string().uuid(),
    invitationId: z.string().uuid(),
});

export const acceptCompanyInvitationSchema = z.object({
    token: z.string().trim().min(32).max(512),
});

export type AcceptCompanyInvitationInput = z.infer<
    typeof acceptCompanyInvitationSchema
>;

export const companyInvitationListQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(254).optional(),
    status: z.nativeEnum(InvitationStatus).optional(),
});

export type CompanyInvitationListQuery = z.infer<
    typeof companyInvitationListQuerySchema
>;