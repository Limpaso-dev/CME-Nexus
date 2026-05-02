import express from "express";
import { markComplete } from "../controllers/progress.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/complete", protect, markComplete);

export default router;