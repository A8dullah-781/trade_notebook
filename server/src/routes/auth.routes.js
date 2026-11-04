import { Router } from "express";
import { signup, login } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

//Request → app → router → controller → service → controller → response.
router.post("/signup", signup);
router.post("/login", login);
router.get("/test-auth", authMiddleware, (req, res) => {
  res.json({ userId: req.user.id });
});


export default router;