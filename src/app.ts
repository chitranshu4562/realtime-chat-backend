import express from "express";
import {errorHandler} from "./middlewares/errorHandler.middleware";
import v1Router from "./routes/v1";
import {httpLogger} from "./middlewares/httpLogger.middleware";
import cookieParser from "cookie-parser";
import { env } from "./config/env";

const app = express();

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", env.CLIENT_URL);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,POST,PUT,DELETE,PATCH,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    if (req.method === "OPTIONS") {
        res.status(204).end();
        return;
    }
    next();
});

app.use(express.json());
app.use(cookieParser());
app.use(httpLogger);

app.use("/api/v1", v1Router);

// Must be LAST — after all routes
app.use((req, res) => {
    res.status(404).json({ success: false, code: "NOT_FOUND" });
});

app.use(errorHandler);

export default app;