import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../errors/AppError";
import { AccessTokenPayload, verifyAccessToken } from "../utils/jwt";

declare global {
    namespace Express {
        interface Request {
            user?: { userId: number, email: string }
        }
    }
}

export function authenticateRequest(req: Request, res: Response, next: NextFunction) {
    const authHeaders = req.headers.authorization;

    if (!authHeaders?.startsWith("Bearer ")) throw new UnauthorizedError("Auth token is missing");

    const token = authHeaders.split(" ")[1];

    try {
        const tokenPayload: AccessTokenPayload = verifyAccessToken(token);
        req.user = { userId: tokenPayload.userId, email: tokenPayload.email }
        next();
    } catch (err) {
        next(err);
    }
}