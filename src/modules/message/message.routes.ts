import { Router } from "express";
import * as messageController from "./message.controller";
import { validate } from "../../middlewares/validate.middleware";
import { getMessagesSchema } from "./message.schema";

const router = Router();

router.get("", validate(getMessagesSchema), messageController.getMessages);

export default router;