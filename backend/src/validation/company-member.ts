
import { z } from "zod";
import { MembershipStatus } from "@prisma/client";

export const companyIdParamsSchema = z.object({
    companyId: z.string().uuid(),
});

export const companyMemberParamsSchema = z.object({
    companyId: z.string().uuid(),
    memberId: z.string().uuid(),
});

export const companyMemberListQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(254).optional(),
    status: z.nativeEnum(MembershipStatus).optional(),
    roleId: z.string().uuid().optional(),
});

export const updateCompanyMemberSchema = z.object({
    roleId: z.string().uuid().optional(),
    department: z.string().trim().max(100).nullable().optional(),
    jobTitle: z.string().trim().max(100).nullable().optional(),
    employeeId: z.string().trim().max(100).nullable().optional(),
    status: z.enum(["ACTIVE", "SUSPENDED"]).optional(),
}).strict().refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field must be provided." },
);

export type CompanyMemberListQuery = z.infer<
    typeof companyMemberListQuerySchema
>;

export type UpdateCompanyMemberInput = z.infer<
    typeof updateCompanyMemberSchema
>;
