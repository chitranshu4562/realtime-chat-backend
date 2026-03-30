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

export interface VerifiedEmailTokenPayload {
    email: string;
    type: "email_verified"; // it will used only for signup
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

export const signVerifiedEmailToken = (email: string): string => {
    return jwt.sign(
        { email: email, type: "email_verified" },
        env.ACCESS_TOKEN_SECRET,
        { expiresIn: env.ACCESS_TOKEN_EXPIRY }
    )
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

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
    try {
        const payload = jwt.verify(token, env.REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
        if (payload.type !== "refresh") throw new Error("Wrong token type");
        return payload;
    } catch {
        throw new UnauthorizedError("Invalid or expired token");
    }
}

export const verifyEmailVerifiedToken = (token: string): VerifiedEmailTokenPayload => {
    try {
        const payload = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as VerifiedEmailTokenPayload;
        if (payload.type !== "email_verified") throw new Error("Wrong Token Type");
        return payload;
    } catch {
        throw new UnauthorizedError("Invalid or expired email verified token");
    }
}
