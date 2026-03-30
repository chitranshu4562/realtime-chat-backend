import {Request, Response, NextFunction, CookieOptions} from 'express';
import * as authService from './auth.service';
import {ApiResponse} from "../../shared/ApiResponse";
import {env} from "../../config/env";

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: "strict" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path: "api/v1/auth/refresh" // cookie only sent to refresh endpoint
} as CookieOptions

export const sendOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;
        await authService.initiateEmailOtp(email);
        ApiResponse.ok(res, 'OTP sent successfully');
    } catch (err) {
        next(err);
    }
}

export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, otp } = req.body;
        const result = await authService.verifyEmailOtp(email, otp);
        ApiResponse.ok(res, 'OTP verified successfully', result);
    } catch (err) {
        next(err);
    }
}

export const signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { verifiedEmailToken, name, phoneNumber, password } = req.body;
        const { refreshToken, accessToken } = await authService.registerUser(verifiedEmailToken, name, phoneNumber, password);

        res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
        ApiResponse.created(res, 'User is registered successfully', { accessToken });
    } catch (err) {
        next(err);
    }
}