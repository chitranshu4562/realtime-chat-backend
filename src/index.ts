import {env} from "./config/env";
import app from "./app";
import prisma from "./config/prisma";
import {logger} from "./shared/logger";
import {redis} from "./config/redis";

async function bootstrap() {
    await prisma.$connect();
    logger.info("Connected to PostgreSQL");

    await redis.connect();

    app.listen(env.PORT, () => {
        console.log(`Server running on port ${env.PORT}`);
    })
}

bootstrap().catch((err) => {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
});