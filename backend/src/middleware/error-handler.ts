import type {
    ErrorRequestHandler,
    RequestHandler,
} from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

type ErrorLike = Error & {
    status?: unknown;
    statusCode?: unknown;
    code?: unknown;
    type?: unknown;
    meta?: unknown;
};

type ErrorResponse = {
    success: false;
    message: string;
    code: string;
    errors?: Array<{
        field: string;
        message: string;
    }>;
    requestId?: string;
    stack?: string;
};

type MappedError = {
    status: number;
    code: string;
    message: string;
};

const isRecord = (
    value: unknown,
): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

function getPrismaError(error: ErrorLike): MappedError | null {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case "P2000":
                return {
                    status: 400,
                    code: error.code,
                    message: "One of the provided values is too long.",
                };

            case "P2002": {
                const target = error.meta?.target;
                const fields = Array.isArray(target)
                    ? target.filter(
                        (value): value is string =>
                            typeof value === "string",
                    )
                    : typeof target === "string"
                        ? [target]
                        : [];

                return {
                    status: 409,
                    code: error.code,
                    message: "A record with these details already exists.",
                };
            }

            case "P2003":
            case "P2014":
                return {
                    status: 409,
                    code: error.code,
                    message:
                        "This operation conflicts with related records.",
                };

            case "P2025":
                return {
                    status: 404,
                    code: error.code,
                    message: "The requested record was not found.",
                };

            case "P2005":
            case "P2006":
            case "P2007":
            case "P2011":
            case "P2012":
            case "P2013":
                return {
                    status: 400,
                    code: error.code,
                    message: "The supplied data could not be saved.",
                };

            case "P2024":
                return {
                    status: 503,
                    code: error.code,
                    message:
                        "The database is temporarily busy. Please try again.",
                };

            default:
                return {
                    status: 500,
                    code: error.code,
                    message: "A database operation failed.",
                };
        }
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
        return {
            status: 503,
            code: "DATABASE_UNAVAILABLE",
            message:
                "The database is temporarily unavailable. Please try again later.",
        };
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
        // Usually indicates an invalid Prisma query in server code.
        // Log the details internally; do not expose them to clients.
        return {
            status: 500,
            code: "DATABASE_QUERY_ERROR",
            message: "An unexpected database error occurred.",
        };
    }

    return null;
}

function mapError(error: ErrorLike): MappedError {
    const prismaError = getPrismaError(error);

    if (prismaError) {
        return prismaError;
    }

    // Invalid JSON or errors raised by Express body parsing.
    if (error.type === "entity.parse.failed") {
        return {
            status: 400,
            code: "INVALID_JSON",
            message: "The request body contains invalid JSON.",
        };
    }

    if (error.type === "entity.too.large") {
        return {
            status: 413,
            code: "PAYLOAD_TOO_LARGE",
            message: "The request body is too large.",
        };
    }

    if (error.type === "encoding.unsupported") {
        return {
            status: 415,
            code: "UNSUPPORTED_ENCODING",
            message: "The request encoding is not supported.",
        };
    }

    // Handles Multer errors without requiring a Multer import.
    if (error.name === "MulterError") {
        const uploadCode =
            typeof error.code === "string" ? error.code : "UPLOAD_ERROR";

        if (uploadCode === "LIMIT_FILE_SIZE") {
            return {
                status: 413,
                code: uploadCode,
                message: "The uploaded file exceeds the size limit.",
            };
        }

        return {
            status: 400,
            code: uploadCode,
            message: "The uploaded file or upload fields are invalid.",
        };
    }

    // Supports existing custom errors such as ServiceError and
    // AuthorizationError, provided they expose statusCode/status.
    const explicitStatus =
        typeof error.statusCode === "number"
            ? error.statusCode
            : typeof error.status === "number"
                ? error.status
                : undefined;

    if (
        explicitStatus !== undefined &&
        Number.isInteger(explicitStatus) &&
        explicitStatus >= 400 &&
        explicitStatus <= 599
    ) {
        return {
            status: explicitStatus,
            code:
                typeof error.code === "string"
                    ? error.code
                    : error.name || "REQUEST_ERROR",
            message: error.message || "The request could not be completed.",
        };
    }

    // Fallbacks for authorization/authentication errors without a status.
    if (
        /unauthorized|authentication|unauthenticated|tokenexpired/i.test(
            error.name,
        )
    ) {
        return {
            status: 401,
            code: "UNAUTHENTICATED",
            message: "Authentication is required or has expired.",
        };
    }

    if (/authorization|forbidden/i.test(error.name)) {
        return {
            status: 403,
            code: "FORBIDDEN",
            message: "You do not have permission to perform this action.",
        };
    }

    return {
        status: 500,
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected server error occurred.",
    };
}

export const globalErrorHandler: ErrorRequestHandler = (
    err,
    req,
    res,
    next,
) => {
    if (res.headersSent) {
        next(err);
        return;
    }

    const error: ErrorLike =
        err instanceof Error
            ? (err as ErrorLike)
            : Object.assign(new Error("Unknown error"), {
                originalError: err,
            });

    const mapped = error instanceof ZodError
        ? {
            status: 400,
            code: "VALIDATION_ERROR",
            message: "Request validation failed.",
        }
        : mapError(error);

    const validationErrors =
        error instanceof ZodError
            ? error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            }))
            : undefined;

    // Log internal details for debugging. Avoid logging request bodies,
    // authorization headers, tokens, or other sensitive user information.
    if (mapped.status >= 500) {
        console.error("[API ERROR]", {
            method: req.method,
            path: req.originalUrl,
            code: mapped.code,
            message: error.message,
            stack: error.stack,
        });
    }

    const requestIdHeader = req.headers["x-request-id"];
    const requestId =
        typeof requestIdHeader === "string" &&
            /^[a-zA-Z0-9._-]{1,100}$/.test(requestIdHeader)
            ? requestIdHeader
            : undefined;

    const response: ErrorResponse = {
        success: false,
        message: mapped.message,
        code: mapped.code,
        ...(validationErrors
            ? { errors: validationErrors }
            : {}),
        ...(requestId ? { requestId } : {}),
    };

    if (process.env.NODE_ENV !== "production" && error.stack) {
        response.stack = error.stack;
    }

    res.status(mapped.status).json(response);
};

// Use this after all application routes to handle unknown endpoints.
export const notFoundHandler: RequestHandler = (
    req,
    _res,
    next,
) => {
    const error = Object.assign(
        new Error(`Route not found: ${req.method} ${req.path}`),
        {
            statusCode: 404,
            code: "ROUTE_NOT_FOUND",
        },
    );

    next(error);
};
