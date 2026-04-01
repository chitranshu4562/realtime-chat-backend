import { Request, Response, NextFunction } from 'express';
import {AppError, ValidationError} from "../errors/AppError";
import {ApiResponse} from "../shared/ApiResponse";
import {logger} from "../shared/logger";

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    if (err instanceof AppError && err.isKnownError) {
        logger.warn(err.message, {
            statusCode: err.statusCode,
            path: req.path,
            method: req.method,
        })
        const errors = err instanceof ValidationError ? err.errors : undefined;
        return ApiResponse.error(res, err.statusCode, err.message, errors);
    }

    logger.error('Unhandled error', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });

    return ApiResponse.error(res, 500, err.message);
}