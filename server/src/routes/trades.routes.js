import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { aTrade, gTrades, dTrade, uTrade, uScreenshot, rScreenshot } from "../controllers/trade.controller.js";
import { uploadScreenshot } from "../middleware/upload.js";

const router = Router()

router.post('/', authMiddleware, aTrade)
router.get('/', authMiddleware, gTrades)
router.delete('/:id', authMiddleware, dTrade)
router.put('/:id', authMiddleware, uTrade)
router.post('/:id/screenshot', authMiddleware, uploadScreenshot, uScreenshot)
router.delete('/:id/screenshot', authMiddleware, rScreenshot)

export default router