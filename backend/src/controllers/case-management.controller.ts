import type {
    Request,
    Response,
    NextFunction,
    RequestHandler,
} from "express";
import { ZodError } from "zod";

import {
    caseParamsSchema,
} from "../validation/case-management.js";

import {
    assignCaseService,
    createCommentService,
    ServiceError,
    updateCaseDetailsService,
} from "../services/case-management.service.js";
import { getClerkUserId } from "../middleware/auth.middleware.js";

function handleControllerError(
    error: unknown,
    res: Response,
    next: NextFunction,
) {
    if (error instanceof ZodError) {
        res.status(400).json({
            success: false,
            message: "Validation failed.",
            errors: error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            })),
        });
        return;
    }

    if (error instanceof ServiceError) {
        res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });
        return;
    }

    next(error);
}

// PATCH /:companyId/cases/:caseId
export const updateCaseDetails: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const { companyId, caseId } = caseParamsSchema.parse(req.params);

        const updatedCase = await updateCaseDetailsService({
            clerkUserId: getClerkUserId(req),
            companyId,
            caseId,
            input: req.body,
        });

        res.status(200).json({
            success: true,
            message: "Case updated successfully.",
            data: updatedCase,
        });
    } catch (error) {
        handleControllerError(error, res, next);
    }
};

// POST /:companyId/cases/:caseId/assignments
export const assignCase: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const { companyId, caseId } = caseParamsSchema.parse(req.params);

        const result = await assignCaseService({
            clerkUserId: getClerkUserId(req),
            companyId,
            caseId,
            input: req.body,
        });

        res.status(result.unchanged ? 200 : 201).json({
            success: true,
            message: result.unchanged
                ? "Case is already assigned to this member."
                : "Case assigned successfully.",
            data: result,
        });
    } catch (error) {
        handleControllerError(error, res, next);
    }
};

// POST /:companyId/cases/:caseId/comments
export const createComment: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const { companyId, caseId } = caseParamsSchema.parse(req.params);

        const comment = await createCommentService({
            clerkUserId: getClerkUserId(req),
            companyId,
            caseId,
            input: req.body,
        });

        res.status(201).json({
            success: true,
            message: "Comment created successfully.",
            data: comment,
        });
    } catch (error) {
        handleControllerError(error, res, next);
    }
};
