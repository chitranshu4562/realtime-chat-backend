import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import {ApiResponse} from "../../shared/ApiResponse";

export const sendOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;
        await authService.sendOtp(email);
        ApiResponse.ok(res, 'OTP sent successfully');
    } catch (err) {
        next(err);
    }
}

export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, otp } = req.body;
        const result = await authService.verifyOtp(email, otp);
        ApiResponse.ok(res, 'OTP verified successfully', result);
    } catch (err) {
        next(err);
    }
}