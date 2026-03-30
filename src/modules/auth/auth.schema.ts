import { z as zod } from "zod";
import {EMAIL_REGEX} from "../../shared/constants";

export const sendOtpSchema = zod.object({
    email: zod
        .string({ error: 'Email is required' })
        .trim()
        .min(1, { error: 'Email is required' })
        .toLowerCase()
        .regex(EMAIL_REGEX, 'Please enter a valid email'),
})

export const verifyOtpSchema = zod.object({
    email: zod
        .string({ error: 'Email is required' })
        .trim()
        .min(1, { error: 'Email is required' })
        .toLowerCase()
        .regex(EMAIL_REGEX, 'Please enter a valid email'),
    otp: zod
        .string({ error: 'OTP is required' })
        .trim()
        .length(6, "OTP must be exactly 6 digits")
        .regex(/^\d+$/, "OTP must contain only digits"),
})