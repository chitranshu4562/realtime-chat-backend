import Redis from "ioredis";
import "dotenv/config";

class RedisClient {
    private static instance: Redis | null = null;

    static getInstance(): Redis {
        if (!RedisClient.instance) {
            RedisClient.instance = new Redis(process.env.REDIS_URL, {
                maxRetriesPerRequest: 1,
                lazyConnect: true
            })

            RedisClient.instance.on("connect", () => {
                console.log("Redis connected");
            });

            RedisClient.instance.on("error", (err) => {
                console.error("Redis error:", err.message);
            });
        }

        return RedisClient.instance;
    }
}

export const redis = RedisClient.getInstance();