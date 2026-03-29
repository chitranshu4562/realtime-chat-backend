import { Request, Response, NextFunction } from 'express';
import {AppError, ValidationError} from "../errors/AppError";
import {ApiResponse} from "../shared/ApiResponse";

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    if (err instanceof AppError && err.isKnownError) {
        const errors = err instanceof ValidationError ? err.errors : undefined;
        return ApiResponse.error(res, err.statusCode, err.message, errors);
    }

    return ApiResponse.error(res, 500, err.message);
}