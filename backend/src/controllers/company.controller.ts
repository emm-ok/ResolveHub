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

    const userId = req.user?.clerkId;


    try {
        const result = await createCompanyService(parsedBody.data, {
            clerkUserId: userId as string,
        });

        res.status(201).json({
            message: "Company created successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}