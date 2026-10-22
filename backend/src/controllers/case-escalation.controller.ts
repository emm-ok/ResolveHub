import type { Request, Response, NextFunction } from "express";

import {
    escalateCaseParamsSchema,
    escalateCaseSchema,
} from "../validation/case-escalation.js";
import { escalateCaseService } from "../services/case-escalation.service.js";
import { getClerkUserId } from "../middleware/auth.middleware.js";

export async function escalateCaseController(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const { companyId, caseId } =
            escalateCaseParamsSchema.parse(req.params);

        const { reason } = escalateCaseSchema.parse(req.body);
        const clerkUserId = getClerkUserId(req);

        const caseRecord = await escalateCaseService({
            clerkUserId,
            companyId,
            caseId,
            reason,
        });

        return res.status(200).json({
            success: true,
            message: "Case escalated successfully.",
            data: caseRecord,
        });
    } catch (error) {
        next(error);
    }
}