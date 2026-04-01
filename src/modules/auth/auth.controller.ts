import {Request, Response, NextFunction, CookieOptions} from 'express';
import * as authService from './auth.service';
import {apiCreatedResponse, apiOkResponse} from "../../helpers/api.response";
import {env} from "../../config/env";
import { UnauthorizedError } from '../../errors/AppError';
import { REFRESH_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_PATH } from '../../helpers/constants';

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: "strict" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path: REFRESH_TOKEN_COOKIE_PATH // cookie only sent to refresh endpoint
} as CookieOptions

export const sendOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;
        await authService.initiateEmailOtp(email);
        apiOkResponse(res, 'OTP sent successfully');
    } catch (err) {
        next(err);
    }
}

export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, otp } = req.body;
        const result = await authService.verifyEmailOtp(email, otp);
        apiOkResponse(res, 'OTP verified successfully', result);
    } catch (err) {
        next(err);
    }
}

export const signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { verifiedEmailToken, name, phoneNumber, password } = req.body;
        const { refreshToken, accessToken } = await authService.registerUser(verifiedEmailToken, name, phoneNumber, password);

        res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, COOKIE_OPTIONS);
        apiCreatedResponse(res, 'User is registered successfully', { accessToken });
    } catch (err) {
        next(err);
    }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const { refreshToken, accessToken } = await authService.loginUser(email, password);

        res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, COOKIE_OPTIONS);
        apiOkResponse(res, "User is logged in successfully", { accessToken });
    } catch (err) {
        next(err);
    }
}

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.refreshToken;
        if (!token) throw new UnauthorizedError("Unauthorised");

        const { refreshToken, accessToken } = await authService.refreshUserTokens(token);

        res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, COOKIE_OPTIONS);
        apiOkResponse(res, "Tokens are refreshed successfully", { accessToken });
    } catch (err) {
        next(err);
    }
}

export const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        if (refreshToken) {
            await authService.logoutUser(refreshToken);
        }

        res.clearCookie("refreshToken", { path: REFRESH_TOKEN_COOKIE_PATH });
        apiOkResponse(res, "User is logged out successfully");
    } catch (err) {
        next(err);
    }
}