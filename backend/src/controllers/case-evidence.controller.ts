
import type { RequestHandler } from "express";

import { caseParamsSchema } from "../validation/case-management.js";
import {
    uploadEvidenceService,
} from "../services/case-evidence.service.js";
import { getClerkUserId } from "../middleware/auth.middleware.js";

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