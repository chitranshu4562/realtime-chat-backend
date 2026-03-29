export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isKnownError: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.isKnownError = true;
        Object.setPrototypeOf(this, AppError.prototype); // Fixes instanceof checks broken by TS→ES5 compilation, it will allow to check object of subclasses
        Error.captureStackTrace(this);
    }
}

export class BadRequestError extends AppError {
    constructor(message: string = "Bad Request") {
        super(message, 400);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = "UnauthorizedError") {
        super(message, 401);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = "Not Found") {
        super(message, 404);
    }
}

export class ValidationError extends AppError {
    public readonly errors: Record<string, string>[];

    constructor(message: string = 'Validation Error', errors: Record<string, string>[] = []) {
        super(message, 422);
        this.errors = errors;
    }
}

export class InternalServerError extends AppError {
    constructor(message: string = "Internal Server Error") {
        super(message, 500);
    }
}