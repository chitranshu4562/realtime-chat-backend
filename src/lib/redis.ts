import Redis from "ioredis";
import { env } from "../config/env";
import { logger } from "../helpers/logger";

class RedisClient {
    private static instance: Redis | null = null;

    static getInstance(): Redis {
        if (!RedisClient.instance) {
            RedisClient.instance = new Redis(env.REDIS_URL, {
                maxRetriesPerRequest: 1,
                lazyConnect: true
            })

            RedisClient.instance.on("connect", () => {
                logger.info("Redis connected");
            });

            RedisClient.instance.on("error", (err) => {
                logger.error("Redis error:", err.message);
            });
        }

        return RedisClient.instance;
    }
}

export const redis = RedisClient.getInstance();