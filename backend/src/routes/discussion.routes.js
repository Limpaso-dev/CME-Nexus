import express from "express";
import {
  createDiscussion,
  getDiscussions
} from "../controllers/discussion.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createDiscussion);
router.get("/:contentId", protect, getDiscussions);

export default router;
