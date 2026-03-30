import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../errors/AppError";
import { AccessTokenPayload, verifyAccessToken } from "../utils/jwt";

declare global {
    namespace Express {
        interface Request {
            user?: { userId: string, email: string }
        }
    }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
    const authHeaders = req.headers.authorization;

    if (!authHeaders?.startsWith("Bearer ")) throw new UnauthorizedError("Auth token is missing");

    const token = authHeaders.split(" ")[1];

    try {
        const tokenPayload: AccessTokenPayload = verifyAccessToken(token);
        req.user = { userId: String(tokenPayload.userId), email: tokenPayload.email }
        next();
    } catch (err) {
        next(err);
    }
}