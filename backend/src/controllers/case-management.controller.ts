import type {
    Request,
    Response,
    NextFunction,
    RequestHandler,
} from "express";
import z, { ZodError } from "zod";

import {
    caseParamsSchema,
} from "../validation/case-management.js";

import {
    assignCaseService,
    createCommentService,
    getCaseActivitiesService,
    getCaseAssignmentsService,
    ServiceError,
    unassignCaseService,
    updateCaseDetailsService,
} from "../services/case-management.service.js";
import { getClerkUserId } from "../middleware/auth.middleware.js";

export function handleControllerError(
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
    const assignParamsSchema = caseParamsSchema.extend({
        memberId: z.string().uuid(),
    });

    try {
        const { companyId, caseId, memberId } = assignParamsSchema.parse(req.params);

        const result = await assignCaseService({
            clerkUserId: getClerkUserId(req),
            companyId,
            caseId,
            memberId,
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


const assignmentParamsSchema = caseParamsSchema.extend({
    assignmentId: z.string().uuid(),
});

const activityQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const unassignCase: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const { companyId, caseId, assignmentId } =
            assignmentParamsSchema.parse(req.params);

        const data = await unassignCaseService({
            clerkUserId: getClerkUserId(req),
            companyId,
            caseId,
            assignmentId,
        });

        res.status(200).json({
            success: true,
            message: "Case assignment removed successfully.",
            data,
        });
    } catch (error) {
        next(error);
    }
};

export const getCaseAssignments: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const { companyId, caseId } =
            caseParamsSchema.parse(req.params);

        const data = await getCaseAssignmentsService({
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

export const getCaseActivities: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const { companyId, caseId } =
            caseParamsSchema.parse(req.params);

        const { page, limit } = activityQuerySchema.parse(req.query);

        const data = await getCaseActivitiesService({
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