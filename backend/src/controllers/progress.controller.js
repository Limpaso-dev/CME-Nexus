import Progress from "../models/Progress.js";
import Content from "../models/Content.js";
import User from "../models/User.js";
import Certificate from "../models/Certificate.js";
import { generateCertificate } from "../utils/generateCertificate.js";
import crypto from "crypto";

export const markComplete = async (req, res) => {
  try {
    const { contentId } = req.body;
    const userId = req.user.id;

    // VALIDATE CONTENT
    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    const user = await User.findById(userId);

    // CHECK EXISTING PROGRESS
    let record = await Progress.findOne({ userId, contentId });

    // IF NEVER STARTED → CREATE COMPLETED
    if (!record) {
      record = await Progress.create({
        userId,
        contentId,
        completed: true,
        completedAt: new Date()
      });

      // ADD CREDITS ON FIRST COMPLETION ONLY
      user.totalCredits += content.credits;
      await user.save();

    } else if (!record.completed) {
      // IF EXISTS BUT NOT COMPLETED → COMPLETE
      record.completed = true;
      record.completedAt = new Date();
      await record.save();

      user.totalCredits += content.credits;
      await user.save();

    } else {
      // ALREADY COMPLETED → DO NOTHING
      return res.json({
        message: "Already completed",
        alreadyCompleted: true
      });
    }

    // GENERATE CERTIFICATE (ONLY ON FIRST COMPLETION)
    const existingCert = await Certificate.findOne({
      userId,
      contentId
    });

    if (!existingCert) {
      const certificateId = crypto.randomBytes(6).toString("hex");

      await Certificate.create({
        userId,
        contentId,
        certificateId,
        issuedAt: new Date()
      });

      await generateCertificate({
        name: user.name,
        title: content.title,
        certificateId
      });
    }

    res.json({
      message: "Marked complete, credits awarded, certificate generated"
    });

  } catch (error) {
    console.error("Progress error:", error);
    res.status(500).json({ message: "Server error" });
  }
};