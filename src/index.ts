import { env } from "./configs/env";
import app from "./app";
import prisma from "./configs/prisma";
import { logger } from "./shared/logger";
import { redis } from "./configs/redis";
import { createServer } from "http";

async function bootstrap() {
    await prisma.$connect();
    logger.info("Connected to PostgreSQL");

    await redis.connect();

    const httpServer = createServer(app);

    httpServer.listen(env.PORT, () => {
        logger.info(`Server running on port ${env.PORT}`);
    })
}

bootstrap().catch((err) => {
    logger.error("❌ Failed to start server:", err);
    process.exit(1);
});