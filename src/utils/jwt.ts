import jwt from "jsonwebtoken";
import {env} from "../config/env";
import {UnauthorizedError} from "../errors/AppError";

export interface AccessTokenPayload {
    userId: string;
    type: "access"
}

export interface RefreshTokenPayload {
    userId: string;
    type: "refresh";
}

export const signAccessToken = (payload: Omit<AccessTokenPayload, "type">): string => {
    return jwt.sign(
        { ...payload, type: "access" },
        env.ACCESS_TOKEN_SECRET,
        { expiresIn: env.ACCESS_TOKEN_EXPIRY }
    );
}

export const signRefreshToken = (payload: Omit<RefreshTokenPayload, "type">): string => {
    return jwt.sign(
        { ...payload, type: "access" },
        env.REFRESH_TOKEN_SECRET,
        { expiresIn: env.REFRESH_TOKEN_EXPIRY }
    );
}

export const verifyAccessToken = (token: string): AccessTokenPayload => {
    try {
        const payload = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as AccessTokenPayload;
        if (payload.type !== "access") throw new Error("Wrong Token Type");
        return payload;
    } catch {
        throw new UnauthorizedError("Invalid or expiry access token");
    }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
        const payload = jwt.verify(token, env.REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
        if (payload.type !== "refresh") throw new Error("Wrong token type");
        return payload;
    } catch {
        throw new UnauthorizedError("Invalid or expired token");
    }
}
