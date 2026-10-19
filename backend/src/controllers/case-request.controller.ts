// import type { Request, Response } from "express";
// import * as caseRequestService from "../services/case-request.service.js"

// export const submitCaseRequest = async (req: Request, res: Response) => {
//     try {
//         const { rawInput } = req.body;

//         const clerkId = req.user?.clerkId;

//         await caseRequestService.submitCaseRequest(
//             rawInput,
//             {
//                 authenticatedClerkUserId: clerkId as string

//             })

//         return res.status(200).json({
//             message: "Request submitted successfully",
//         })
//     } catch (error) {
//         console.error(error)
//         return res.status(500).json({
//             message: "Failed to submit request",
//         })
//     }
// }


// export const acceptCaseRequest = async (req: Request, res: Response) => {
//     try {
//         const { companyId, requestId } = req.params;

//         const clerkId = req.user?.clerkId;

//         const request = await caseRequestService.acceptCaseRequest({
//             clerkUserId: clerkId as string,
//             companyId: companyId as string,
//             requestId: requestId as string
//         })

//         return res.status(200).json({
//             message: "Request successfully accepted",
//             case: request.case,
//             request: request.request,
//         })
//     } catch (error) {
//         console.error(error)
//         return res.status(500).json({
//             message: "Failed to accept request",
//         })
//     }
// }

// export const rejectCaseRequest = async (req: Request, res: Response) => {
//     try {
//         const { reason } = req.body;
//         const { companyId, requestId } = req.params;

//         const clerkId = req.user?.clerkId;

//         const request = await caseRequestService.rejectCaseRequest({
//             clerkUserId: clerkId as string,
//             companyId: companyId as string,
//             requestId: requestId as string,
//             reason
//         })

//         return res.status(200).json({
//             message: "Request successfully rejected",
//             request,
//         })
//     } catch (error) {
//         console.error(error)
//         return res.status(500).json({
//             message: "Failed to reject request",
//         })
//     }
// }



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
    companySlugParamsSchema,
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
    const params = companySlugParamsSchema.safeParse(req.params);

    if (!params.success) {
        sendValidationError(res, params.error);
        return;
    }

    try {
        const company = await prisma.company.findUnique({
            where: { slug: params.data.slug },
            select: { id: true },
        });

        if (!company) {
            res.status(404).json({ message: "Company not found." });
            return;
        }

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

        const userId = req.user?.clerkId; 

        const caseRequest = await submitCaseRequestService(
            parsedBody.data,
            { clerkUserId: userId as string },
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

    const userId = req.user?.clerkId; 

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