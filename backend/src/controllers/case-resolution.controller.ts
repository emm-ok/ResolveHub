import type { RequestHandler } from "express";
import { caseParamsSchema } from "../validation/case-management.js";
import { proposeResolutionService } from "../services/case-resolution.service.js";
import { getClerkUserId } from "../middleware/auth.middleware.js";
import {
    resolutionParamsSchema,
    resolutionDecisionSchema,
} from "../validation/case-management.js";

import {
    acceptResolutionService,
    getCaseResolutionsService,
    rejectResolutionService,
    withdrawResolutionService,
} from "../services/case-resolution.service.js";

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

export const getCaseResolutions: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const { companyId, caseId } =
            resolutionParamsSchema.pick({
                companyId: true,
                caseId: true,
            }).parse(req.params);

        const data = await getCaseResolutionsService({
            clerkUserId: getClerkUserId(req),
            companyId,
            caseId,
        });

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

export const acceptResolution: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const { companyId, caseId, resolutionId } =
            resolutionParamsSchema.parse(req.params);

        const { reason } = resolutionDecisionSchema.parse(req.body ?? {});

        const data = await acceptResolutionService({
            clerkUserId: getClerkUserId(req),
            companyId,
            caseId,
            resolutionId,
            ...(reason !== undefined ? { reason } : {}),
        });

        res.status(200).json({
            success: true,
            message: "Resolution accepted successfully.",
            data,
        });
    } catch (error) {
        next(error);
    }
};

export const rejectResolution: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const { companyId, caseId, resolutionId } =
            resolutionParamsSchema.parse(req.params);

        const { reason } = resolutionDecisionSchema.parse(req.body ?? {});

        const data = await rejectResolutionService({
            clerkUserId: getClerkUserId(req),
            companyId,
            caseId,
            resolutionId,
            ...(reason !== undefined ? { reason } : {}),
        });

        res.status(200).json({
            success: true,
            message: "Resolution rejected successfully.",
            data,
        });
    } catch (error) {
        next(error);
    }
};

export const withdrawResolution: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const { companyId, caseId, resolutionId } =
            resolutionParamsSchema.parse(req.params);

        const data = await withdrawResolutionService({
            clerkUserId: getClerkUserId(req),
            companyId,
            caseId,
            resolutionId,
        });

        res.status(200).json({
            success: true,
            message: "Resolution withdrawn successfully.",
            data,
        });
    } catch (error) {
        next(error);
    }
};