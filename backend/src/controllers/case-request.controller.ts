import type {
    Request,
    Response,
    NextFunction,
} from "express";

import { getAuth } from "@clerk/express";
import { RequestChannel } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

import {
    submitCaseRequestSchema,
    rejectCaseRequestSchema,
    requestActionParamsSchema,
} from "../validation/case-request.schema.js";

import {
    submitCaseRequest as submitCaseRequestService,
    acceptCaseRequest as acceptCaseRequestService,
    rejectCaseRequest as rejectCaseRequestService,
} from "../services/case-request.service.js";

function sendValidationError(res: Response, error: {
    issues: Array<{ path: PropertyKey[]; message: string }>;
}): void {
    res.status(400).json({
        message: "Validation failed.",
        errors: error.issues.map((issue) => ({
            field: issue.path.map(String).join("."),
            message: issue.message,
        })),
    });
}

/**
 * POST /api/public/companies/:slug/requests
 *
 * Public intake: the customer does not need an account.
 * Signed-in customers are linked to their existing user profile.
 */
export async function submitCaseRequestController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const company = await prisma.company.findUnique({
            where: { id: req.params.companyId as string },
            select: { id: true },
        });

        if (!company) {
            res.status(404).json({ message: "Company not found." });
            return;
        }
        const { clerkId } = req.body;
        // Never trust companyId or channel supplied by the customer.
        const parsedBody = submitCaseRequestSchema.safeParse({
            ...req.body,
            companyId: company.id,
            channel: RequestChannel.WEB_FORM,
        });

        if (!parsedBody.success) {
            sendValidationError(res, parsedBody.error);
            return;
        }

        // const userId = req.user?.clerkId; 

        const caseRequest = await submitCaseRequestService(
            parsedBody.data,
            { clerkUserId: clerkId as string },
        );

        res.status(201).json({
            message: "Case request submitted successfully.",
            data: caseRequest,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/companies/:companyId/requests/:requestId/accept
 */
export async function acceptCaseRequestController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const params = requestActionParamsSchema.safeParse(req.params);

    if (!params.success) {
        sendValidationError(res, params.error);
        return;
    }

    // const userId = req.user?.clerkId;
    const {userId } = req.body;

    console.log("UserId", userId)
    try {
        const result = await acceptCaseRequestService({
            clerkUserId: userId as string,
            companyId: params.data.companyId,
            requestId: params.data.requestId,
        });

        res.status(200).json({
            message: "Case request accepted and case created successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/companies/:companyId/requests/:requestId/reject
 */
export async function rejectCaseRequestController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const params = requestActionParamsSchema.safeParse(req.params);

    if (!params.success) {
        sendValidationError(res, params.error);
        return;
    }

    const parsedBody = rejectCaseRequestSchema.safeParse(req.body);

    if (!parsedBody.success) {
        sendValidationError(res, parsedBody.error);
        return;
    }

    const userId = req.user?.clerkId;

    try {
        const result = await rejectCaseRequestService({
            clerkUserId: userId as string,
            companyId: params.data.companyId,
            requestId: params.data.requestId,
            reason: parsedBody.data.reason,
        });

        res.status(200).json({
            message: "Case request rejected successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}