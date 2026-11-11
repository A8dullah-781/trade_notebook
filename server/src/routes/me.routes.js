import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { gMe, uMe } from "../controllers/me.controller.js";
import { changePass } from "../controllers/me.controller.js";
import { passwordLimiter } from "../middleware/rateLimiter.js";
import { changeEmail } from "../controllers/me.controller.js";

const router = Router()

router.get('/', authMiddleware, gMe)
router.put('/', authMiddleware, uMe)
router.put('/password', authMiddleware, passwordLimiter, changePass);
router.put("/email", authMiddleware, passwordLimiter, changeEmail);

export default router