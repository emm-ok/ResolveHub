import { CaseCategory, CasePriority, RequestChannel } from "@prisma/client";
import { z } from "zod";

export const createCaseRequestSchema = z.object({
    companyId: z.string().uuid(),

    requesterName: z
        .string()
        .trim()
        .min(2, "Name must contain at least 2 characters.")
        .max(120),

    requesterEmail: z
        .string()
        .trim()
        .email("Enter a valid email address.")
        .max(254)
        .transform((email) => email.toLowerCase()),

    requesterPhone: z
        .string()
        .trim()
        .max(30)
        .optional()
        .nullable(),

    title: z
        .string()
        .trim()
        .min(5, "Title must contain at least 5 characters.")
        .max(200),

    description: z
        .string()
        .trim()
        .min(20, "Please provide more information.")
        .max(10_000),

    category: z
        .enum([
            "BILLING",
            "REFUND",
            "PRODUCT_ISSUE",
            "SERVICE_ISSUE",
            "ACCOUNT_ACCESS",
            "COMPLAINT",
            "INQUIRY",
            "OTHER",
        ])
        .default("OTHER"),

    channel: z
        .enum([
            "WEB_FORM",
            "EMAIL",
            "PHONE",
            "CHAT",
            "API",
            "INTERNAL",
        ])
        .default("WEB_FORM"),
});

export type CreateCaseRequestInput = z.infer<
    typeof createCaseRequestSchema
>;


export const submitCaseRequestSchema = z
    .object({
        companyId: z.string().uuid(),

        requesterName: z.string().trim().min(2).max(120),

        requesterEmail: z
            .string()
            .trim()
            .email()
            .transform((email) => email.toLowerCase()),

        requesterPhone: z.string().trim().max(30).nullable().optional(),

        title: z.string().trim().min(5).max(200),

        description: z.string().trim().min(20).max(10_000),

        category: z.nativeEnum(CaseCategory).default(CaseCategory.OTHER),

        requestedPriority: z
            .nativeEnum(CasePriority)
            .nullable()
            .optional(),

        channel: z
            .nativeEnum(RequestChannel)
            .default(RequestChannel.WEB_FORM),
    })
    .strict();


export const rejectCaseRequestSchema = z
    .object({
        reason: z
            .string()
            .trim()
            .min(10, "Rejection reason must contain at least 10 characters.")
            .max(1000, "Rejection reason cannot exceed 1000 characters."),
    })
    .strict();


// export const companySlugParamsSchema = z.object({
//     slug: z
//         .string()
//         .trim()
//         .min(2)
//         .max(100)
//         .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
// });

export const requestActionParamsSchema = z.object({
    companyId: z.string().uuid(),
    requestId: z.string().uuid(),
});



// FETCH CASE-REQUEST 
export const companyResourceParamsSchema = z.object({
    companyId: z.string().min(1),
});

export const caseRequestParamsSchema =
    companyResourceParamsSchema.extend({
        requestId: z.string().min(1),
    });
export const myCaseRequestParamsSchema = z.object({
        requestId: z.string().min(1),
    });

export const caseDetailsParamsSchema =
    companyResourceParamsSchema.extend({
        caseId: z.string().min(1),
    });

export const listResourcesQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(100).optional(),
    status: z.string().trim().optional(),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
