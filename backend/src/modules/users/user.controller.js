import { getAuth } from "@clerk/express";
import { prisma } from "../../lib/prisma.js";
import { ensureUserExists } from "./user.service.js";
export async function getUserByClerkId(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required",
            });
        }
        const user = await ensureUserExists(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "ResolveHub user not found",
            });
        }
        return res.json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve user",
        });
    }
}
//# sourceMappingURL=user.controller.js.map