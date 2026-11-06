import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { aTrade } from "../controllers/trade.controller.js";

const router = Router()

router.post('/', authMiddleware, aTrade)

export default router