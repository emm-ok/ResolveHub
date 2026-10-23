
import type { NextFunction, Request, RequestHandler, Response } from "express";

import { caseParamsSchema } from "../validation/case-management.js";
import { getClerkUserId } from "../middleware/auth.middleware.js";
import {
    uploadEvidenceService,
    getCaseEvidenceService,
    getEvidenceDetailsService,
    deleteEvidenceService,
} from "../services/case-evidence.service.js";
import z from "zod";
import {
    companyEvidenceParamsSchema,
} from "../validation/company-reporting.js";
import {
    // deleteCaseEvidenceService,
    downloadCaseEvidenceService,
} from "../services/case-evidence.service.js";

// POST /:companyId/cases/:caseId/evidence
export const uploadEvidence: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const { companyId, caseId } = caseParamsSchema.parse(req.params);

        const evidence = await uploadEvidenceService({
            clerkUserId: getClerkUserId(req),
            companyId,
            caseId,
            ...(req.file ? { file: req.file } : {}),
            input: req.body,
        });

        res.status(201).json({
            success: true,
            message: "Evidence uploaded successfully.",
            data: evidence,
        });
    } catch (error) {
        next(error);
    }
};

const evidenceParamsSchema = caseParamsSchema.extend({
    evidenceId: z.string().uuid(),
});

const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const getCaseEvidence: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const { companyId, caseId } =
            caseParamsSchema.parse(req.params);

        const { page, limit } = paginationSchema.parse(req.query);

        const data = await getCaseEvidenceService({
            clerkUserId: getClerkUserId(req),
            companyId,
            caseId,
            page,
            limit,
        });

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

export const getEvidenceDetails: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const { companyId, caseId, evidenceId } =
            evidenceParamsSchema.parse(req.params);

        const data = await getEvidenceDetailsService({
            clerkUserId: getClerkUserId(req),
            companyId,
            caseId,
            evidenceId,
        });

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteEvidence: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const { companyId, caseId, evidenceId } =
            evidenceParamsSchema.parse(req.params);

        const data = await deleteEvidenceService({
            clerkUserId: getClerkUserId(req),
            companyId,
            caseId,
            evidenceId,
        });

        res.status(200).json({
            success: true,
            message: "Evidence deleted successfully.",
            data,
        });
    } catch (error) {
        next(error);
    }
};


export async function downloadCaseEvidenceController(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const params = companyEvidenceParamsSchema.safeParse(req.params);

        if (!params.success) {
            res.status(400).json({
                success: false,
                message: "Invalid evidence download parameters.",
                errors: params.error.flatten(),
            });
            return;
        }

        const data = await downloadCaseEvidenceService({
            clerkUserId: getClerkUserId(req),
            ...params.data,
        });

        res.status(200).json({
            success: true,
            message: "Secure evidence download URL generated.",
            data,
        });
    } catch (error) {
        next(error);
    }
}

// export async function deleteCaseEvidenceController(
//     req: Request,
//     res: Response,
//     next: NextFunction,
// ) {
//     try {
//         const params = companyEvidenceParamsSchema.safeParse(req.params);

//         if (!params.success) {
//             res.status(400).json({
//                 success: false,
//                 message: "Invalid evidence deletion parameters.",
//                 errors: params.error.flatten(),
//             });
//             return;
//         }

//         const data = await deleteCaseEvidenceService({
//             clerkUserId: getClerkUserId(req),
//             ...params.data,
//         });

//         res.status(200).json({
//             success: true,
//             message: "Evidence deleted successfully.",
//             data,
//         });
//     } catch (error) {
//         next(error);
//     }
// }