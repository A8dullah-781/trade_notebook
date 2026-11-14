import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { getDSummary, gDCalendar } from "../controllers/dashboard.controller.js";

const router = Router();

router.get("/summary", authMiddleware, getDSummary);
router.get("/calendar", authMiddleware, gDCalendar);

export default router;