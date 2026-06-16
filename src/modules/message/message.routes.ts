import { Router } from "express";
import * as messageController from "./message.controller";
import { validate } from "../../middlewares/validate.middleware";
import { getMessageDetailsSchema, getMessagesSchema } from "./message.schema";

const router = Router();

router.get("", validate(getMessagesSchema), messageController.getMessages);
router.get("/details", validate(getMessageDetailsSchema), messageController.getMessageDetails);

export default router;