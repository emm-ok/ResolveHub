import { z } from "zod";

const optionalText = (max: number) =>
    z.preprocess(
        (value) =>
            typeof value === "string" && value.trim() === ""
                ? undefined
                : value,
        z.string().trim().max(max).optional(),
    );

const optionalEmail = z.preprocess(
    (value) =>
        typeof value === "string" && value.trim() === ""
            ? undefined
            : value,
    z
        .string()
        .trim()
        .email()
        .transform((email) => email.toLowerCase())
        .optional(),
);

const optionalUrl = z.preprocess(
    (value) =>
        typeof value === "string" && value.trim() === ""
            ? undefined
            : value,
    z
        .string()
        .trim()
        .url()
        .refine(
            (value) => /^https?:\/\//i.test(value),
            "URL must use HTTP or HTTPS.",
        )
        .optional(),
);

export const createCompanySchema = z
    .object({
        name: z.string().trim().min(2).max(120),

        slug: z.preprocess(
            (value) =>
                typeof value === "string" && value.trim() === ""
                    ? undefined
                    : value,
            z
                .string()
                .trim()
                .toLowerCase()
                .min(2)
                .max(80)
                .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
                .optional(),
        ),

        email: optionalEmail,
        phone: optionalText(30),
        website: optionalUrl,
        logoUrl: optionalUrl,
        description: optionalText(1000),
        address: optionalText(255),
        city: optionalText(100),
        state: optionalText(100),
        country: optionalText(100),

        timezone: z.string().trim().min(1).max(100).default("UTC"),

        publicIntakeEnabled: z.boolean().default(true),
    })
    .strict();

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;


export const companyIdParamsSchema = z.object({
    companyId: z.string().uuid("Invalid company ID."),
});

export const updateCompanySchema = z
    .object({
        clerkUserId: z.string(),
        name: z.string().trim().min(2).max(150).optional(),
        slug: z
            .string()
            .trim()
            .min(2)
            .max(100)
            .regex(
                /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                "Slug must contain lowercase letters, numbers, and hyphens.",
            )
            .optional(),
        email: z.string().trim().email().max(254).nullable().optional(),
        phone: z.string().trim().max(30).nullable().optional(),
        website: z.string().trim().url().max(2048).nullable().optional(),
        logoUrl: z.string().trim().url().max(2048).nullable().optional(),
        description: z.string().trim().max(2000).nullable().optional(),
        address: z.string().trim().max(300).nullable().optional(),
        city: z.string().trim().max(100).nullable().optional(),
        state: z.string().trim().max(100).nullable().optional(),
        country: z.string().trim().max(100).nullable().optional(),
        timezone: z.string().trim().min(1).max(100).optional(),
        publicIntakeEnabled: z.boolean().optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
        message: "Provide at least one field to update.",
    });

export const deactivateCompanySchema = z.object({
    reason: z.string().trim().min(3).max(1000).optional(),
});

export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;