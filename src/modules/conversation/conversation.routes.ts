import { Router } from "express";
import { authenticateRequest } from "../../middleware/authenticate";
import * as conversationController from "./conversation.controller";
import { validate } from "../../middleware/validate";
import { createConversationSchema } from "./conversation.schema";

const router = Router();

router.post("/create", validate(createConversationSchema), conversationController.create)

export default router;

