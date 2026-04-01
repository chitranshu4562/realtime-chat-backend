import { env } from "./config/env";
import app from "./app";
import prisma from "./lib/prisma";
import { logger } from "./helpers/logger";
import { redis } from "./lib/redis";
import { createServer } from "http";
import { initSocketServer } from "./socket";

async function bootstrap() {
    await prisma.$connect();
    logger.info("Connected to PostgreSQL");

    await redis.connect();

    const httpServer = createServer(app);

    // ── 3. Attach Socket.IO to the same HTTP server ──────────────────────────
    initSocketServer(httpServer);
    logger.info('[socket] server initialized')

    httpServer.listen(env.PORT, () => {
        logger.info(`Server running on port ${env.PORT}`);
    })
}

bootstrap().catch((err) => {
    logger.error("❌ Failed to start server:", err);
    process.exit(1);
});