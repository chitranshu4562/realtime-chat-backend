import { Router } from "express";
import * as usersController from "./users.controller";

const router = Router();

router.get("/", usersController.users);

export default router;

