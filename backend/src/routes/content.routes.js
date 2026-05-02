import express from "express";
import {
  createContent,
  getAllContent,
  getSingleContent,
  updateContent,
  deleteContent
} from "../controllers/content.controller.js";

import {
  protect,
  adminOnly
} from "../middleware/auth.middleware.js";
import { uploadContentFiles } from "../middleware/upload.middleware.js";

const router = express.Router();

router.get("/", protect, getAllContent);
router.get("/:id", protect, getSingleContent);

/**
 * ADMIN ROUTES
 */
router.post("/", protect, adminOnly, uploadContentFiles, createContent);
router.put("/:id", protect, adminOnly, uploadContentFiles, updateContent);
router.delete("/:id", protect, adminOnly, deleteContent);

export default router;
