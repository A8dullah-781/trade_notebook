import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { me } from "../controllers/me.controller.js";

const router = Router()

router.get('/', authMiddleware, me)

export default router