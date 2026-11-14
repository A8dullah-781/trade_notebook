import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { gMe, rAvatar, uMe } from "../controllers/me.controller.js";
import { changePass } from "../controllers/me.controller.js";
import { passwordLimiter } from "../middleware/rateLimiter.js";
import { changeEmail } from "../controllers/me.controller.js";
import { uploadAvatar } from "../middleware/upload.js";
import { uAvatar } from "../controllers/me.controller.js";

const router = Router()

router.get('/', authMiddleware, gMe)
router.put('/', authMiddleware, uMe)
router.put('/password', authMiddleware, passwordLimiter, changePass);
router.put("/email", authMiddleware, passwordLimiter, changeEmail);
router.post("/avatar", authMiddleware, uploadAvatar, uAvatar);
router.delete("/avatar", authMiddleware, rAvatar);

export default router