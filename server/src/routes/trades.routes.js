import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { aTrade, gTrades, dTrade, uTrade } from "../controllers/trade.controller.js";

const router = Router()

router.post('/', authMiddleware, aTrade)
router.get('/', authMiddleware, gTrades)
router.delete('/:id', authMiddleware, dTrade)
router.put('/:id', authMiddleware, uTrade)

export default router