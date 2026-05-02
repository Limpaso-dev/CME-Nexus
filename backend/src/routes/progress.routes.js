import express from "express";
import {
  getMyProgress,
  markComplete,
  markModuleRead
} from "../controllers/progress.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/module", protect, markModuleRead);
router.post("/complete", protect, markComplete);
router.get("/mine", protect, getMyProgress);

export default router;
