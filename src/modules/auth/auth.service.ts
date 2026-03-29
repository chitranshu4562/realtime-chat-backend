import prisma from "../../config/prisma";
import {ConflictError, TooManyRequestsError} from "../../errors/AppError";
import {env} from "../../config/env";
import {redis} from "../../config/redis";
import {generateOtp} from "../../utils/otp";
import {sgMail} from "../../config/sendgrid";

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
        const otpData = JSON.parse(existing);
        const ttl = await redis.ttl(OTP_KEY(email));
        const elapsedTime = ttl - OTP_TTL;
        if (elapsedTime < 60) {
            throw new TooManyRequestsError(`Please wait ${60 - elapsedTime} seconds before requesting a new OTP`);
        }
    }

    const otp = generateOtp();
    await redis.setex(OTP_KEY(email), OTP_TTL, JSON.stringify(otp));

    await sgMail.send({
        to: email,
        from: env.SENDGRID_SENDER_EMAIL,
        subject: 'Email verification OTP',
        text: `Your OTP is: ${otp}, valid for ${OTP_TTL / 60} minutes.`,
        html: `
            <div style="font-family: sans-serif; max-width: 400px;">
                <h2>Verify your email</h2>
                <p>Your one-time password is:</p>
                <h1 style="letter-spacing: 8px; color: #4F46E5;">${otp}</h1>
                <p>Valid for <strong>${OTP_TTL / 60} minutes</strong>. Do not share this code.</p>
            </div>
        `
    })

}