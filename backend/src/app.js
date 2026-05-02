import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import contentRoutes from "./routes/content.routes.js";
import progressRoutes from "./routes/progress.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import certificateRoutes from "./routes/certificate.routes.js";

const app = express();

/**
 * ✅ CORS CONFIG (PRODUCTION SAFE)
 */
app.use(cors({
  origin: [
    "http://localhost:5173",
    process.env.FRONTEND_URL
  ],
  credentials: true
}));

/**
 * ✅ BODY PARSER
 */
app.use(express.json());

/**
 * ✅ ROUTES
 */
app.use("/api/auth", authRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/certificate", certificateRoutes);

/**
 * ✅ HEALTH CHECK (IMPORTANT FOR RENDER)
 */
app.get("/", (req, res) => {
  res.send("API is running...");
});

/**
 * ✅ GLOBAL ERROR HANDLER
 */
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(500).json({
    message: "Internal server error"
  });
});

export default app;