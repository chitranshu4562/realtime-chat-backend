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