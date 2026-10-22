import type { Request, Response, NextFunction } from "express";

import {
    invitationParamsSchema,
    sendCompanyInvitationSchema,
} from "../validation/company-invitation.js";
import { sendCompanyInvitationService } from "../services/company-invitation.service.js";
import { getClerkUserId } from "../middleware/auth.middleware.js";

export async function sendCompanyInvitationController(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const { companyId } = invitationParamsSchema.parse(req.params);
        const input = sendCompanyInvitationSchema.parse(req.body);
        const clerkUserId = getClerkUserId(req);

        const invitation = await sendCompanyInvitationService({
            clerkUserId,
            companyId,
            input,
        });

        return res.status(201).json({
            success: true,
            message: "Company invitation sent successfully.",
            data: invitation,
        });
    } catch (error) {
        next(error);
    }
}