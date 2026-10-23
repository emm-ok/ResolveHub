import type {
    Request,
    Response,
    NextFunction,
} from "express";

import { ensureUserExists } from "./user.service.js";
import { getClerkUserId } from "../../middleware/auth.middleware.js";

export async function getUserByClerkId(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const clerkUserId = getClerkUserId(req);

        const user = await ensureUserExists(clerkUserId);

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
}