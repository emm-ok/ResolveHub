import type {
    Request,
    Response,
    NextFunction,
} from "express";

import { getAuth } from "@clerk/express";
import { createCompanySchema } from "../validation/company.js";
import { createCompany as createCompanyService } from "../services/company.service.js";

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

    const auth = getAuth(req);

    if (!auth.userId) {
        res.status(401).json({
            message: "Authentication required.",
        });
        return;
    }

    // This endpoint expects the caller's already-active Clerk organization.
    // Do not allow a caller to create a local record for an unrelated org.
    if (
        auth.orgId !== parsedBody.data.clerkOrganizationId ||
        auth.orgRole !== "org:admin"
    ) {
        res.status(403).json({
            message: "You must be an administrator of this Clerk organization.",
        });
        return;
    }

    try {
        const result = await createCompanyService(parsedBody.data, {
            clerkUserId: auth.userId,
        });

        res.status(201).json({
            message: "Company created successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}