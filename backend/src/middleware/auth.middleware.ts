import type { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { ServiceError } from "../services/case-management.service.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        clerkId: string;
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

  req.user = { clerkId: userId };

  next();
}

export function getClerkUserId(req: Request): string {
    const clerkUserId = req.user?.clerkId;

    if (!clerkUserId) {
        throw new ServiceError(401, "Authentication required.");
    }

    return clerkUserId;
}

export {};