import "dotenv/config";
import { z as zod } from "zod";

const envSchema = zod.object({
    NODE_ENV: zod.enum(["development", "production"]).default("development"),
    PORT: zod.coerce.number().default(3000),

    DATABASE_URL: zod.string().min(1),
    REDIS_URL: zod.string().min(1),

    ACCESS_TOKEN_SECRET: zod.string().min(32),
    ACCESS_TOKEN_EXPIRY: zod.string().default("15m"),

    REFRESH_TOKEN_SECRET: zod.string().min(32),
    REFRESH_TOKEN_EXPIRY: zod.string().default("7d"),

    OTP_EXPIRY_IN_SECONDS: zod.coerce.number().default(300),
    OTP_MAX_ATTEMPTS: zod.coerce.number().default(5),

    RESEND_API_KEY: zod.string().min(1),
    SENDER_EMAIL: zod.string().min(1),
})

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
}

export const env = parsed.data;