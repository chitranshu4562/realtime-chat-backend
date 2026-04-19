import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../errors/AppError";

declare global {
    namespace Express {
        interface Request {
            parsedQuery?: unknown
        }
    }
}

export function validate(schema: ZodSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
        const data = req.method === 'GET' ? req.query : req.body;
        const result = schema.safeParse(data);

        if (!result.success) {
            const errors = result.error.issues.map((err) => ({
                field: err.path.join("."),
                message: err.message,
            }))

            const firstErrorMessage = errors[0].message;
            return next(new ValidationError(firstErrorMessage, errors));
        }

        if (req.method === "GET") {
            req.parsedQuery = result.data;
            Object.assign(req.query, result.data);
        } else {
            req.body = result.data;
        }
        next();
    }
}