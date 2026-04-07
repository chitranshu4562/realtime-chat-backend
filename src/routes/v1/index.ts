import { Router } from "express";
import authRoutes from "../../modules/auth/auth.routes";
import conversationRouter from "../../modules/conversation/conversation.routes";
import usersRouter from "../../modules/users/users.routes";
import { authenticateRequest } from "../../middlewares/authenticateRequest.middleware";

const v1Router = Router();

// unauthenticated routes
v1Router.use("/auth", authRoutes);
v1Router.use(authenticateRequest);

// authenticated routes
v1Router.use("/conversations", conversationRouter);
v1Router.use("/users", usersRouter);

export default v1Router;