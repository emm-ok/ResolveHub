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