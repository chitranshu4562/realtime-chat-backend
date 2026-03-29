import { Router } from 'express';
import * as authController from './auth.controller';
import {validate} from "../../middleware/validate";
import {sendOtpSchema} from "./auth.schema";

const router = Router();

router.post("/send-otp", validate(sendOtpSchema), authController.sendOtp);

export default router;