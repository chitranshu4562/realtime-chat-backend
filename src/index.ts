import { env } from "./config/env";
import app from "./app";
import prisma from "./config/prisma";
import { logger } from "./shared/logger";
import { redis } from "./config/redis";
import { createServer } from "http";
import { createSocketServer } from "./socket/socket.server";

async function bootstrap() {
    await prisma.$connect();
    logger.info("Connected to PostgreSQL");

    await redis.connect();

    const httpServer = createServer(app);

    createSocketServer(httpServer);

    httpServer.listen(env.PORT, () => {
        logger.info(`Server running on port ${env.PORT}`);
    })
}

bootstrap().catch((err) => {
    logger.error("❌ Failed to start server:", err);
    process.exit(1);
});