import { z } from "zod";
import {
    AttachmentVisibility,
    CaseCategory,
    CasePriority,
    CaseStatus,
    CommentVisibility,
} from "@prisma/client";

export const caseParamsSchema = z.object({
    companyId: z.string().uuid(),
    caseId: z.string().uuid(),
});

export const updateCaseDetailsSchema = z
    .object({
        title: z.string().trim().min(5).max(200).optional(),
        description: z.string().trim().min(10).max(10000).optional(),
        category: z.enum(CaseCategory).optional(),
        priority: z.enum(CasePriority).optional(),
        status: z.enum(CaseStatus).optional(),
    })
    .refine(
        (data) => Object.values(data).some((value) => value !== undefined),
        { message: "Provide at least one field to update." },
    );

export const assignCaseSchema = z.object({
    // This is the Company's CompanyMember.id, not the user's Clerk ID.
    note: z.string().trim().max(1000).optional(),
});

export const createCommentSchema = z.object({
    body: z.string().trim().min(1).max(10000),
    visibility: z.enum(CommentVisibility).default("INTERNAL"),
});


export const uploadEvidenceSchema = z.object({
    caption: z.string().trim().max(500).optional(),
    visibility: z.enum(AttachmentVisibility).default("INTERNAL"),
});

export const proposeResolutionSchema = z.object({
    summary: z.string().trim().min(5).max(200),
    details: z.string().trim().min(10).max(10000).optional(),
});

