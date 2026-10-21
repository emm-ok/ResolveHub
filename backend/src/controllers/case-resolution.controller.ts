import type { RequestHandler } from "express";
import { caseParamsSchema } from "../validation/case-management.js";
import { proposeResolutionService } from "../services/case-resolution.service.js";
import { getClerkUserId } from "../middleware/auth.middleware.js";

// POST /:companyId/cases/:caseId/resolutions
export const proposeResolution: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const { companyId, caseId } = caseParamsSchema.parse(req.params);

        const resolution = await proposeResolutionService({
            clerkUserId: getClerkUserId(req),
            companyId,
            caseId,
            input: req.body,
        });

        res.status(201).json({
            success: true,
            message: "Resolution proposed successfully.",
            data: resolution,
        });
    } catch (error) {
        next(error);
    }
};
