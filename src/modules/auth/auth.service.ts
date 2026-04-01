import prisma from "../../configs/prisma";
import {
    BadRequestError,
    ConflictError,
    NotFoundError,
    TooManyRequestsError,
    UnauthorizedError
} from "../../errors/AppError";
import {env} from "../../configs/env";
import {redis} from "../../configs/redis";
import {generateOtp} from "../../utils/otp";
import {sendOtpInEmail} from "../../shared/email/email.service";
import {
    RefreshTokenPayload,
    signAccessToken,
    signRefreshToken,
    signVerifiedEmailToken,
    VerifiedEmailTokenPayload,
    verifyEmailVerifiedToken, verifyRefreshToken
} from "../../utils/jwt";
import {AuthTokens, OtpData} from "./auth.types";
import {comparePassword, hashPassword, hashToken} from "../../utils/hash";

const OTP_KEY = (email: string) => `otp:${email}`;
const OTP_TTL = env.OTP_EXPIRY_IN_SECONDS;

export const initiateEmailOtp = async (email: string): Promise<void> => {
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

    await sendOtpInEmail({to: email, otp: otp, expiresInMinutes: OTP_TTL});
}

export const verifyEmailOtp = async (email: string, otp: string): Promise<{ verifiedEmailToken: string }> => {
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

export const registerUser = async (verifiedEmailToken: string, name: string, phoneNumber: string, password: string): Promise<AuthTokens> => {
    const verifiedEmailPayload: VerifiedEmailTokenPayload = verifyEmailVerifiedToken(verifiedEmailToken);

    const existingUser = await prisma.user.findUnique({
        where: { email: verifiedEmailPayload.email },
        select: { id: true }
    })

    if (existingUser) {
        throw new ConflictError("Email already registered");
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
        data: {
            email: verifiedEmailPayload.email,
            password: hashedPassword,
            name, phoneNumber
        }
    })

    return issueTokens(user.id, user.email);
}

export const loginUser = async (email: string, password: string): Promise<AuthTokens> => {
    const user = await prisma.user.findUnique({
        where: { email: email },
    })
    if (!user) throw new NotFoundError("User does not exist");

    const isValid = await comparePassword(password, user.password);
    if (!isValid) throw new BadRequestError("Password is incorrect");

    // delete existing refresh tokens
    await prisma.refreshToken.deleteMany({ where: { user } });

    return issueTokens(user.id, user.email);
}

export const refreshUserTokens = async (refreshToken: string): Promise<AuthTokens> => {
    const payload: RefreshTokenPayload = verifyRefreshToken(refreshToken);
    const tokenHash = hashToken(refreshToken);

    const storedTokenData = await prisma.refreshToken.findUnique({ where: { tokenHash }, include: { user: true } });
    if (!storedTokenData) throw new UnauthorizedError('All sessions have been revoked, please login again');

    if (storedTokenData.revokedAt || storedTokenData.expiresAt < new Date()) {
        await prisma.refreshToken.deleteMany({ where: { tokenHash } });
        throw new UnauthorizedError("Refresh token expired or revoked");
    }

    await prisma.refreshToken.deleteMany({ where: { tokenHash } })

    return issueTokens(storedTokenData.user.id, storedTokenData.user.email)
}

export const logoutUser = async (refreshToken: string): Promise<void> => {
    const tokenHash = hashToken(refreshToken);
    await prisma.refreshToken.deleteMany({ where: { tokenHash } })
}

async function issueTokens(userId: number, email: string): Promise<AuthTokens> {
    const refreshToken = signRefreshToken({ userId, email });
    const accessToken = signAccessToken({ userId, email });

    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.upsert({
        where: { userId },
        update: { tokenHash, expiresAt, revokedAt: null },
        create: { userId, tokenHash, expiresAt }
    });

    return { accessToken, refreshToken }
}