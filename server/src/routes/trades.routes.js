import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { aTrade, listTrades, dTrade } from "../controllers/trade.controller.js";

const router = Router()

router.post('/', authMiddleware, aTrade)
router.get('/', authMiddleware, listTrades)
router.delete('/:id', authMiddleware, dTrade)

export default router