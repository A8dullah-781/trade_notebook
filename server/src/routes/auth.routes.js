import { Router } from "express";
import { signup, login } from "../controllers/auth.controller.js";
import { verifyEToken } from "../controllers/token.controller.js";
import { resendVEmail } from "../controllers/email.controller.js";
import { forgotPass, resetPass } from "../controllers/me.controller.js";
import {
  loginLimiter,
  forgotLimiter,
  resendLimiter,
  signupLimiter,
} from "../middleware/rateLimiter.js";

const router = Router();

//Request → app → router → controller → service → controller → response.
router.post("/signup", signupLimiter, signup);
router.post("/login", loginLimiter, login);
router.post("/verify", verifyEToken);
router.post("/resend", resendLimiter, resendVEmail);
router.post("/forgot", forgotLimiter, forgotPass);
router.post("/reset", resetPass);

export default router;