import express from "express";
import {errorHandler} from "./middlewares/errorHandler";
import v1Router from "./routes/v1";
import {httpLogger} from "./middlewares/httpLogger";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(cors({
    origin: true,
    credentials: true,
}))

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