import express from "express";
import Certificate from "../models/Certificate.js";
import { protect } from "../middleware/auth.middleware.js";
import path from "path";
import fs from "fs/promises";

const router = express.Router();

/**
 * GET MY CERTIFICATES
 */
router.get("/mine", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const certs = await Certificate.find({ userId })
      .populate("contentId", "title")
      .sort({ createdAt: -1 });

    res.json(certs);

  } catch (err) {
    console.error("Fetch certificates error:", err);
    res.status(500).json({ message: "Failed to fetch certificates" });
  }
});

/**
 * DOWNLOAD CERTIFICATE PDF
 */
router.get("/download/:id", protect, async (req, res) => {
  try {
    const cert = await Certificate.findOne({
      certificateId: req.params.id,
      userId: req.user.id
    });

    if (!cert) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    // ✅ safer absolute path
    const filePath = path.join(
      process.cwd(),
      "certificates",
      `${cert.certificateId}.pdf`
    );

    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ message: "File not found" });
    }

    res.download(filePath);

  } catch (err) {
    console.error("Download certificate error:", err);
    res.status(500).json({ message: "Failed to download certificate" });
  }
});

/**
 * VERIFY CERTIFICATE (PUBLIC - QR)
 */
router.get("/verify/:id", async (req, res) => {
  try {
    const cert = await Certificate.findOne({
      certificateId: req.params.id
    }).populate("userId contentId");

    if (!cert) {
      return res.status(404).json({ valid: false });
    }

    res.json({
      valid: true,
      user: cert.userId?.name,
      content: cert.contentId?.title,
      issuedAt: cert.issuedAt
    });

  } catch (err) {
    console.error("Verify certificate error:", err);
    res.status(500).json({ valid: false });
  }
});

export default router;