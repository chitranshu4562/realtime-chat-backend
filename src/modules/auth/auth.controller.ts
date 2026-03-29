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