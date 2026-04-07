import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../errors/AppError";

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

        req.body = result.data;
        next();
    }
}