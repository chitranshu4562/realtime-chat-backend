import { Router } from "express";
import * as conversationController from "./conversation.controller";
import { validate } from "../../middlewares/validate";
import { createConversationSchema } from "./conversation.schema";

const router = Router();

router.post("/create", validate(createConversationSchema), conversationController.create)

export default router;

