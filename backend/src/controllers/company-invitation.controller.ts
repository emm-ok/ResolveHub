import type { Request, Response, NextFunction } from "express";

import {
    companyInvitationListQuerySchema,
    invitationParamsSchema,
    sendCompanyInvitationSchema,
} from "../validation/company-invitation.js";
import { getCompanyInvitationsService, sendCompanyInvitationService } from "../services/company-invitation.service.js";
import { getClerkUserId } from "../middleware/auth.middleware.js";
import {
    acceptCompanyInvitationSchema,
    invitationDetailsParamsSchema,
} from "../validation/company-invitation.js";
import {
    acceptCompanyInvitationService,
    getCompanyInvitationService,
} from "../services/company-invitation.service.js";
import { companyIdParamsSchema } from "../validation/company-member.js";

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


export async function getCompanyInvitationsController(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const params = companyIdParamsSchema.safeParse(req.params);
        const query = companyInvitationListQuerySchema.safeParse(req.query);

        if (!params.success || !query.success) {
            res.status(400).json({
                success: false,
                message: "Invalid invitation list parameters.",
                errors: {
                    ...(params.success ? {} : { params: params.error.flatten() }),
                    ...(query.success ? {} : { query: query.error.flatten() }),
                },
            });
            return;
        }

        const data = await getCompanyInvitationsService({
            clerkUserId: getClerkUserId(req),
            companyId: params.data.companyId,
            query: query.data,
        });

        res.status(200).json({
            success: true,
            message: "Company invitations retrieved successfully.",
            data,
        });
    } catch (error) {
        next(error);
    }
}


export async function getCompanyInvitationController(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const params = invitationDetailsParamsSchema.safeParse(req.params);

        if (!params.success) {
            res.status(400).json({
                success: false,
                message: "Invalid company or invitation ID.",
                errors: params.error.flatten(),
            });
            return;
        }

        const clerkUserId = getClerkUserId(req);

        const invitation = await getCompanyInvitationService({
            clerkUserId,
            companyId: params.data.companyId,
            invitationId: params.data.invitationId,
        });

        res.status(200).json({
            success: true,
            message: "Invitation details retrieved successfully.",
            data: invitation,
        });
    } catch (error) {
        next(error);
    }
}

export async function acceptCompanyInvitationController(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const body = acceptCompanyInvitationSchema.safeParse(req.body);

        if (!body.success) {
            res.status(400).json({
                success: false,
                message: "Invalid invitation acceptance request.",
                errors: body.error.flatten(),
            });
            return;
        }

        const clerkUserId = getClerkUserId(req);

        const result = await acceptCompanyInvitationService({
            clerkUserId,
            token: body.data.token,
        });

        res.status(200).json({
            success: true,
            message: "Company invitation accepted successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}
