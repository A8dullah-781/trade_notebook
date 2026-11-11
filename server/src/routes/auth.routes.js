import { Router } from "express";
import { signup, login } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.js";
import { forgotLimiter, loginLimiter, passwordLimiter } from "../middleware/rateLimiter.js";
import {forgotPass, resendVEmail, resetPass, verifyToken} from '../controllers/verifyToken.controller.js'
import { resendLimiter } from "../middleware/rateLimiter.js";

const router = Router();

//Request → app → router → controller → service → controller → response.
router.post("/signup", signup);
router.post("/login", loginLimiter, login);
router.post("/verify", verifyToken);
router.post('/resend', resendLimiter, resendVEmail);
router.post('/forgot', forgotLimiter, forgotPass);
router.post('/reset', resetPass);


export default router;