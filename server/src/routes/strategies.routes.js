import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { strategies, cStrategies } from "../controllers/strategies.controller.js";

const router = Router()

router.get('/', authMiddleware, strategies)
router.post('/', authMiddleware,cStrategies)

export default router