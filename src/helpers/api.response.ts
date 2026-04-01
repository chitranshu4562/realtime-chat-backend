import { Response } from "express";

interface SuccessResponse<T> {
    success: true;
    message: string;
    data?: T;
}

interface ErrorResponse {
    success: false;
    message: string;
    errors?: unknown;
}

export function apiOkResponse<T>(res: Response, message: string = "Success", data?: T): Response<SuccessResponse<T>> {
    return res.status(200).json({
        success: true,
        message,
        data,
    });
}

export function apiCreatedResponse<T>(res: Response, message: string = "Created", data?: T): Response<SuccessResponse<T>> {
    return res.status(201).json({
        success: true,
        message,
        data,
    });
}

export function apiErrorResponse(res: Response, statusCode: number, message: string, errors?: unknown): Response<ErrorResponse> {
    const body: ErrorResponse = { success: false, message: message };
    if (errors !== undefined) {
        body.errors = errors;
    }

    return res.status(statusCode).json(body);
}