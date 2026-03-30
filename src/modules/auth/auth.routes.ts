import { Router } from 'express';
import * as authController from './auth.controller';
import {validate} from "../../middleware/validate";
import {sendOtpSchema, signUpSchema, verifyOtpSchema} from "./auth.schema";

const router = Router();

router.post("/send-otp", validate(sendOtpSchema), authController.sendOtp);
router.post("/verify-otp", validate(verifyOtpSchema), authController.verifyOtp);
router.post("/signup", validate(signUpSchema), authController.signup);

export default router;