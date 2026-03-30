import { z as zod } from "zod";
import {EMAIL_REGEX, PHONE_NUMBER_REGEX} from "../../shared/constants";

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

export const signUpSchema = zod.object({
    verifiedEmailToken: zod
        .string({ error: 'Email token is required' })
        .trim()
        .min(1, { error: 'Email token is required' }),
    name: zod
        .string({ error: 'Name is required' })
        .trim()
        .min(1, { error: 'Name is required' }),
    phoneNumber: zod
        .string({ error: 'Phone number is required' })
        .trim()
        .min(1, { error: 'Phone number is required' })
        .regex(PHONE_NUMBER_REGEX, 'Please enter a valid 10 digit phone number starting from 6 to 9'),
    password: zod
        .string({ error: 'Password is required' })
        .trim()
        .min(1, { error: 'Password is required' }),
})