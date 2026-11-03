import { Router } from "express";
import { signup } from "../controllers/auth.controller.js";

const router = Router();

//Request → app → router → controller → service → controller → response.
router.post("/signup", signup);

export default router;