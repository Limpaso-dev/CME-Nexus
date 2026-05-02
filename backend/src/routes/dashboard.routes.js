import express from "express";
import { getAdminDashboard, getDashboard } from "../controllers/dashboard.controller.js";
import { adminOnly, protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getDashboard);
router.get("/admin", protect, adminOnly, getAdminDashboard);

export default router;
