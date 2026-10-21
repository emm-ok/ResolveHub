import type { RequestHandler } from "express";
import { caseParamsSchema } from "../validation/case-management.js";
import { handleControllerError } from "./case-management.controller.js";
import { getClerkUserId } from "../middleware/auth.middleware.js";
import { createCommentService } from "../services/case-comment.service.js";
import { z } from "zod";
import {
    deleteCommentService,
    getCaseCommentsService,
} from "../services/case-comment.service.js";

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

const commentParamsSchema = caseParamsSchema.extend({
    commentId: z.string().uuid(),
});

const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const getCaseComments: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const { companyId, caseId } = caseParamsSchema.parse(req.params);
        const { page, limit } = paginationSchema.parse(req.query);

        const data = await getCaseCommentsService({
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

export const deleteComment: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const { companyId, caseId, commentId } =
            commentParamsSchema.parse(req.params);

        const data = await deleteCommentService({
            clerkUserId: getClerkUserId(req),
            companyId,
            caseId,
            commentId,
        });

        res.status(200).json({
            success: true,
            message: "Comment deleted successfully.",
            data,
        });
    } catch (error) {
        next(error);
    }
};