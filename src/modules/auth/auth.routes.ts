import { Router } from 'express';
import * as authController from './auth.controller';
import {validate} from "../../middleware/validate";
import {loginSchema, sendOtpSchema, signUpSchema, verifyOtpSchema} from "./auth.schema";

const router = Router();

router.post("/send-otp", validate(sendOtpSchema), authController.sendOtp);
router.post("/verify-otp", validate(verifyOtpSchema), authController.verifyOtp);
router.post("/signup", validate(signUpSchema), authController.signup);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

export default router;