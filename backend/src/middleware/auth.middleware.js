import { getAuth } from "@clerk/express";
export function requireAuthentication(req, res, next) {
    const { isAuthenticated, userId } = getAuth(req);
    if (!isAuthenticated || !userId) {
        return res.status(401).json({
            success: false,
            message: "Authentication required",
        });
    }
    req.user = { id: userId };
    next();
}
export {};
//# sourceMappingURL=auth.middleware.js.map