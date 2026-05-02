import express from "express";
import {
  createContent,
  getAllContent
} from "../controllers/content.controller.js";

import {
  protect,
  adminOnly
} from "../middleware/auth.middleware.js";

const router = express.Router();

// PUBLIC
router.get("/", getAllContent);

// ADMIN ONLY
router.post("/", protect, adminOnly, createContent);

export default router;