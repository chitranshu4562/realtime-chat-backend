import { Router } from 'express';
import * as authController from './auth.controller';
import {validate} from "../../middleware/validate";
import {sendOtpSchema, verifyOtpSchema} from "./auth.schema";

const router = Router();

router.post("/send-otp", validate(sendOtpSchema), authController.sendOtp);
router.post("/verify-otp", validate(verifyOtpSchema), authController.verifyOtp);

export default router;