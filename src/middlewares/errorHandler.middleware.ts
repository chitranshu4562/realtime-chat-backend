import { Request, Response, NextFunction } from 'express';
import {AppError, ValidationError} from "../errors/AppError";
import {apiErrorResponse} from "../helpers/api.response";
import {logger} from "../helpers/logger";

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    if (err instanceof AppError && err.isKnownError) {
        logger.warn(err.message, {
            statusCode: err.statusCode,
            path: req.path,
            method: req.method,
        })
        const errors = err instanceof ValidationError ? err.errors : undefined;
        return apiErrorResponse(res, err.statusCode, err.message, errors);
    }

    logger.error('Unhandled error', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });

    return apiErrorResponse(res, 500, err.message);
}