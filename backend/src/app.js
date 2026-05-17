import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import contentRoutes from "./routes/content.routes.js";
import progressRoutes from "./routes/progress.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import certificateRoutes from "./routes/certificate.routes.js";
import discussionRoutes from "./routes/discussion.routes.js";
import { rateLimit, securityHeaders } from "./middleware/security.middleware.js";

const app = express();

app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(securityHeaders);

/**
 * ✅ CORS CONFIG (SAFE + FLEXIBLE)
 */
const allowedOrigins = [
  "http://localhost:5173",
  ...(process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
];

app.use(cors({
  origin: (origin, callback) => {
    // allow non-browser requests (like Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));

/**
 * ✅ HANDLE PREFLIGHT (IMPORTANT)
 */
/**
 * ✅ BODY PARSER
 */
app.use(express.json({ limit: "1mb" }));

/**
 * ✅ SIMPLE LOGGER (VERY USEFUL)
 */
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

/**
 * ✅ ROUTES
 */
app.use(
  "/api/auth/login",
  rateLimit({ max: 20, message: "Too many login attempts. Try again later." })
);
app.use(
  "/api/auth/register",
  rateLimit({ max: 10, message: "Too many registration attempts. Try again later." })
);
app.use("/api/auth", authRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/certificate", certificateRoutes);
app.use("/api/discussions", discussionRoutes);

/**
 * ✅ HEALTH CHECK (UPGRADED)
 */
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    service: "CME Nexus API",
    time: new Date().toISOString()
  });
});

/**
 * ❌ 404 HANDLER (IMPORTANT)
 */
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found"
  });
});

/**
 * ✅ GLOBAL ERROR HANDLER
 */
app.use((err, req, res, next) => {
  console.error("Global error:", err);

  res.status(err.status || 500).json({
    message: err.message || "Internal server error"
  });
});

export default app;
