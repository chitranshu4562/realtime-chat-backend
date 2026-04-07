import { Router } from "express";
import * as conversationController from "./conversation.controller";
import { validate } from "../../middlewares/validate.middleware";
import { createConversationSchema, getConversationsSchema } from "./conversation.schema";

const router = Router();

router.post("/create", validate(createConversationSchema), conversationController.create);
router.get("", validate(getConversationsSchema), conversationController.getConversations);

export default router;

