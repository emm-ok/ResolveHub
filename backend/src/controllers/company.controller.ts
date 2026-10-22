import type {
    Request,
    Response,
    NextFunction,
} from "express";

import { createCompanySchema } from "../validation/company.js";
import { createCompany as createCompanyService } from "../services/company.service.js";
import {
    companyIdParamsSchema,
    deactivateCompanySchema,
    updateCompanySchema,
} from "../validation/company.js";

import {
    deactivateCompanyService,
    getCompaniesService,
    getCompanyService,
    updateCompanyService,
} from "../services/company.service.js";
import { getClerkUserId } from "../middleware/auth.middleware.js";

export async function createCompanyController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const parsedBody = createCompanySchema.safeParse(req.body);

    if (!parsedBody.success) {
        res.status(400).json({
            message: "Company validation failed.",
            errors: parsedBody.error.issues.map((issue) => ({
                field: issue.path.map(String).join("."),
                message: issue.message,
            })),
        });
        return;
    }

    const clerkUserId = getClerkUserId(req);

    try {
        const result = await createCompanyService(parsedBody.data, {
            clerkUserId,
        });

        res.status(201).json({
            message: "Company created successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /companies
 */
export async function getCompaniesController(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const clerkUserId = getClerkUserId(req);

        const companies = await getCompaniesService(clerkUserId);

        return res.status(200).json({
            success: true,
            data: companies,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /companies/:companyId
 */
export async function getCompanyController(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const { companyId } = companyIdParamsSchema.parse(req.params);
        const clerkUserId = getClerkUserId(req);

        const company = await getCompanyService({
            clerkUserId,
            companyId,
        });

        return res.status(200).json({
            success: true,
            data: company,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * PATCH /companies/:companyId
 */
export async function updateCompanyController(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const { companyId } = companyIdParamsSchema.parse(req.params);
        const input = updateCompanySchema.parse(req.body);
        const clerkUserId = getClerkUserId(req);

        const company = await updateCompanyService({
            clerkUserId,
            companyId,
            input,
        });

        return res.status(200).json({
            success: true,
            message: "Company settings updated successfully.",
            data: company,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /companies/:companyId
 */
export async function deactivateCompanyController(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const { companyId } = companyIdParamsSchema.parse(req.params);
        const { reason } = deactivateCompanySchema.parse(req.body ?? {});
        const clerkUserId = getClerkUserId(req);

        const company = await deactivateCompanyService({
            clerkUserId,
            companyId,
            ...(reason !== undefined ? { reason } : {}),
        });

        return res.status(200).json({
            success: true,
            message: "Company deactivated successfully.",
            data: company,
        });
    } catch (error) {
        next(error);
    }
}