import { Router } from "express";
import * as usersController from "./users.controller";
import { validate } from "../../middlewares/validate.middleware";
import { usersSchema } from "./users.schema";

const router = Router();

router.get("/", validate(usersSchema), usersController.users);

export default router;

