export type SuccessResponse<T> = {
    success: true;
    message: string;
    data: T
}

export type ErrorResponse = {
    success: false;
    message: string
}

export type SocketResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

export type AckCallback<T = unknown> = (res: SocketResponse<T>) => void;

export function ok<T>(message: string, data: T): SuccessResponse<T> {
    return {
        success: true,
        message,
        data,
    }
}

export function fail(message: string): ErrorResponse {
    return {
        success: false,
        message,
    }
}