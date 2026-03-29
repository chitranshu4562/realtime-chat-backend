import { Response } from "express";

interface SuccessResponse<T> {
    success: true;
    message: string;
    data?: T;
}

interface ErrorResponse {
    success: false;
    message: string;
    error?: unknown;
}

export class ApiResponse {
    static ok<T>(res: Response, data: T, message: 'Success'): Response<SuccessResponse<T>> {
        return res.status(200).json({
            success: true,
            message: message,
            data: data,
        })
    }

    static created<T>(res: Response, data: T, message: 'Created'): Response<SuccessResponse<T>> {
        return res.status(201).json({
            success: true,
            message: message,
            data: data,
        })
    }

    static error(res: Response, statusCode: number, message: string, errors?: unknown): Response<ErrorResponse> {
        return res.status(statusCode).json({
            success: false,
            message: message,
            ...(errors && { errors: errors })
        })
    }
}