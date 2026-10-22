import type { Request, Response, NextFunction } from "express";

import {
    allCompaniesQuerySchema,
    auditLogsQuerySchema,
    reactivateCompanyParamsSchema,
} from "../validation/company-admin.js";

import {
    getAllCompaniesService,
    getAuditLogsService,
    reactivateCompanyService,
} from "../services/company-admin.service.js";
import { getClerkUserId } from "../middleware/auth.middleware.js";

export async function reactivateCompanyController(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const { companyId } =
            reactivateCompanyParamsSchema.parse(req.params);

        const clerkUserId = getClerkUserId(req);

        const company = await reactivateCompanyService({
            clerkUserId,
            companyId,
        });

        return res.status(200).json({
            success: true,
            message: "Company reactivated successfully.",
            data: company,
        });
    } catch (error) {
        next(error);
    }
}

export async function getAllCompaniesController(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const query = allCompaniesQuerySchema.parse(req.query);
        const clerkUserId = getClerkUserId(req);

        const result = await getAllCompaniesService({
            clerkUserId,
            ...query,
        });

        return res.status(200).json({
            success: true,
            data: result.items,
            pagination: result.pagination,
        });
    } catch (error) {
        next(error);
    }
}

export async function getAuditLogsController(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const query = auditLogsQuerySchema.parse(req.query);
        const clerkUserId = getClerkUserId(req);

        const result = await getAuditLogsService({
            clerkUserId,
            ...query,
        });

        return res.status(200).json({
            success: true,
            data: result.items,
            pagination: result.pagination,
        });
    } catch (error) {
        next(error);
    }
}