import express from "express";
import Certificate from "../models/Certificate.js";
import { protect } from "../middleware/auth.middleware.js";
import path from "path";
import fs from "fs";

const router = express.Router();

// GET MY CERTIFICATES
router.get("/mine", protect, async (req, res) => {
  const userId = req.user.id;

  const certs = await Certificate.find({ userId })
    .populate("contentId", "title")
    .sort({ createdAt: -1 });

  res.json(certs);
});

// DOWNLOAD CERTIFICATE PDF
router.get("/download/:id", protect, async (req, res) => {
  const cert = await Certificate.findOne({
    certificateId: req.params.id,
    userId: req.user.id
  });

  if (!cert) return res.status(404).send("Not found");

  const filePath = path.resolve(`./certificates/${cert.certificateId}.pdf`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }

  res.download(filePath);
});

// VERIFY (PUBLIC — used by QR)
router.get("/verify/:id", async (req, res) => {
  const cert = await Certificate.findOne({
    certificateId: req.params.id
  }).populate("userId contentId");

  if (!cert) {
    return res.status(404).json({ valid: false });
  }

  res.json({
    valid: true,
    user: cert.userId.name,
    content: cert.contentId.title,
    issuedAt: cert.issuedAt
  });
});

export default router;