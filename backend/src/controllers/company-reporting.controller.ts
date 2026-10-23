
import type { Request, Response, NextFunction } from "express";
import {
    companyParamsSchema,
    companyReportQuerySchema,
} from "../validation/company-reporting.js";
import {
    getCompanyDashboardService,
    getCompanyReportsService,
} from "../services/company-reporting.service.js";
import { getClerkUserId } from "../middleware/auth.middleware.js";

export async function getCompanyDashboardController(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const params = companyParamsSchema.safeParse(req.params);

        if (!params.success) {
            res.status(400).json({
                success: false,
                message: "Invalid company ID.",
                errors: params.error.flatten(),
            });
            return;
        }

        const data = await getCompanyDashboardService({
            clerkUserId: getClerkUserId(req),
            companyId: params.data.companyId,
        });

        res.status(200).json({
            success: true,
            message: "Company dashboard retrieved successfully.",
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function getCompanyReportsController(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const params = companyParamsSchema.safeParse(req.params);
        const query = companyReportQuerySchema.safeParse(req.query);

        if (!params.success || !query.success) {
            res.status(400).json({
                success: false,
                message: "Invalid company report parameters.",
                errors: {
                    ...(params.success ? {} : { params: params.error.flatten() }),
                    ...(query.success ? {} : { query: query.error.flatten() }),
                },
            });
            return;
        }

        const data = await getCompanyReportsService({
            clerkUserId: getClerkUserId(req),
            companyId: params.data.companyId,
            query: query.data,
        });

        res.status(200).json({
            success: true,
            message: "Company report retrieved successfully.",
            data,
        });
    } catch (error) {
        next(error);
    }
}
