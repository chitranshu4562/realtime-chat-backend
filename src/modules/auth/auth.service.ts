import prisma from "../../config/prisma";
import {BadRequestError, ConflictError, TooManyRequestsError} from "../../errors/AppError";
import {env} from "../../config/env";
import {redis} from "../../config/redis";
import {generateOtp} from "../../utils/otp";
import {sendOtpToEmail} from "../../shared/services/email/email.service";
import {signVerifiedEmailToken} from "../../utils/jwt";
import {OtpData} from "./auth.types";

const OTP_KEY = (email: string) => `otp:${email}`;
const OTP_TTL = env.OTP_EXPIRY_IN_SECONDS;

export const sendOtp = async (email: string): Promise<void> => {
    const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true }
    });

    if (existingUser) {
        throw new ConflictError("Email already registered");
    }

    const existing = await redis.get(OTP_KEY(email));
    if (existing) {
        const otpData: OtpData = JSON.parse(existing);
        const ttl = await redis.ttl(OTP_KEY(email));
        const elapsedTime = OTP_TTL - ttl;
        if (elapsedTime < 60) {
            throw new TooManyRequestsError(`Please wait ${60 - elapsedTime} seconds before requesting a new OTP`);
        }
    }

    const otp = generateOtp();
    const otpData: OtpData = {otp: otp, attempts: 0, verified: false};
    await redis.setex(OTP_KEY(email), OTP_TTL, JSON.stringify(otpData));

    await sendOtpToEmail({to: email, otp: otp, expiresInMinutes: OTP_TTL});
}

export const verifyOtp = async (email: string, otp: string): Promise<{ verifiedEmailToken: string }> => {
    const raw = await redis.get(OTP_KEY(email));
    if (!raw) {
        throw new BadRequestError("OTP expired or not found");
    }

    const otpData: OtpData = JSON.parse(raw);

    if (otpData.attempts >= env.OTP_MAX_ATTEMPTS) {
        await redis.del(OTP_KEY(email));
        throw new TooManyRequestsError("You have reached max attempts, please send OTP again");
    }

    if (otpData.otp !== otp) {
        otpData.attempts += 1;
        const remainingTTL = await redis.ttl(OTP_KEY(email));
        await redis.setex(OTP_KEY(email), remainingTTL, JSON.stringify(otpData));

        const remainingAttempts = env.OTP_MAX_ATTEMPTS - otpData.attempts;
        throw new BadRequestError(`Incorrect OTP, You have ${remainingAttempts} more attempts.`)
    }

    await redis.del(OTP_KEY(email));

    const verifiedToken = signVerifiedEmailToken(email);

    return { verifiedEmailToken: verifiedToken };
}