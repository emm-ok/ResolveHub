
import type { Request, Response, NextFunction } from "express";
import {
    companyIdParamsSchema,
    companyMemberListQuerySchema,
    companyMemberParamsSchema,
    updateCompanyMemberSchema,
} from "../validation/company-member.js";
import {
    getCompanyMembersService,
    removeCompanyMemberService,
    updateCompanyMemberService,
} from "../services/company-member.service.js";
import { getClerkUserId } from "../middleware/auth.middleware.js";

export async function getCompanyMembersController(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const params = companyIdParamsSchema.safeParse(req.params);
        const query = companyMemberListQuerySchema.safeParse(req.query);

        if (!params.success || !query.success) {
            res.status(400).json({
                success: false,
                message: "Invalid company member list parameters.",
                errors: {
                    ...(params.success ? {} : { params: params.error.flatten() }),
                    ...(query.success ? {} : { query: query.error.flatten() }),
                },
            });
            return;
        }

        const data = await getCompanyMembersService({
            clerkUserId: getClerkUserId(req),
            companyId: params.data.companyId,
            query: query.data,
        });

        res.status(200).json({
            success: true,
            message: "Company members retrieved successfully.",
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function updateCompanyMemberController(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const params = companyMemberParamsSchema.safeParse(req.params);
        const body = updateCompanyMemberSchema.safeParse(req.body);

        if (!params.success || !body.success) {
            res.status(400).json({
                success: false,
                message: "Invalid member update request.",
                errors: {
                    ...(params.success ? {} : { params: params.error.flatten() }),
                    ...(body.success ? {} : { body: body.error.flatten() }),
                },
            });
            return;
        }

        const data = await updateCompanyMemberService({
            clerkUserId: getClerkUserId(req),
            companyId: params.data.companyId,
            memberId: params.data.memberId,
            input: body.data,
        });

        res.status(200).json({
            success: true,
            message: "Company member updated successfully.",
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function removeCompanyMemberController(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const params = companyMemberParamsSchema.safeParse(req.params);

        if (!params.success) {
            res.status(400).json({
                success: false,
                message: "Invalid company or member ID.",
                errors: params.error.flatten(),
            });
            return;
        }

        const data = await removeCompanyMemberService({
            clerkUserId: getClerkUserId(req),
            companyId: params.data.companyId,
            memberId: params.data.memberId,
        });

        res.status(200).json({
            success: true,
            message: "Company member removed successfully.",
            data,
        });
    } catch (error) {
        next(error);
    }
}
