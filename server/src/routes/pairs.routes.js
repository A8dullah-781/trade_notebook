import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { sPairs } from "../controllers/pairs.controller.js";

const router = Router()

router.get('/search', authMiddleware, sPairs)

export default router