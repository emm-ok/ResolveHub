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
        clerkOrganizationId: z.string().trim().min(3).max(255),

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