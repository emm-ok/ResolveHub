import type { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

export function requireAuthentication(
  req: Request,
  res: Response,
  next: NextFunction
) {
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