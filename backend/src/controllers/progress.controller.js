import crypto from "crypto";
import mongoose from "mongoose";
import Certificate from "../models/Certificate.js";
import Content from "../models/Content.js";
import Progress from "../models/Progress.js";
import User from "../models/User.js";
import { generateCertificate } from "../utils/generateCertificate.js";

const buildProgressSnapshot = (record, content) => {
  const moduleCount = content.modules.length;
  const completedModuleCount = record.completedModuleIds.length;
  const percentComplete = moduleCount > 0
    ? Math.round((completedModuleCount / moduleCount) * 100)
    : record.completed ? 100 : 0;

  record.percentComplete = percentComplete;
  return record;
};

export const markModuleRead = async (req, res) => {
  try {
    const { contentId, moduleId } = req.body;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      return res.status(400).json({ message: "Invalid content id" });
    }

    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    const moduleExists = content.modules.some((module) => String(module._id) === moduleId);
    if (!moduleExists) {
      return res.status(404).json({ message: "Module not found" });
    }

    let record = await Progress.findOne({ userId, contentId });
    if (!record) {
      record = await Progress.create({
        userId,
        contentId,
        completedModuleIds: [],
        percentComplete: 0
      });
    }

    if (!record.completedModuleIds.includes(moduleId)) {
      record.completedModuleIds.push(moduleId);
    }

    record.lastReadModuleId = moduleId;
    buildProgressSnapshot(record, content);
    await record.save();

    return res.json({
      message: "Module marked as read",
      progress: record
    });
  } catch (error) {
    console.error("Module progress error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const markComplete = async (req, res) => {
  try {
    const { contentId } = req.body;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      return res.status(400).json({ message: "Invalid content id" });
    }

    const [content, user] = await Promise.all([
      Content.findById(contentId),
      User.findById(userId)
    ]);

    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let record = await Progress.findOne({ userId, contentId });
    if (!record) {
      record = await Progress.create({
        userId,
        contentId,
        completedModuleIds: [],
        percentComplete: 0
      });
    }

    if (content.learningMode === "course" && content.modules.length > 0) {
      const moduleIds = content.modules.map((module) => String(module._id));
      const readAllModules = moduleIds.every((moduleId) => record.completedModuleIds.includes(moduleId));

      if (!readAllModules) {
        buildProgressSnapshot(record, content);

        return res.status(400).json({
          message: "Read all course modules before marking this course as complete",
          progress: record
        });
      }
    }

    if (record.completed) {
      const existingCertificate = await Certificate.findOne({ userId, contentId });

      return res.json({
        message: "Already completed",
        alreadyCompleted: true,
        progress: buildProgressSnapshot(record, content),
        certificateId: existingCertificate?.certificateId ?? null
      });
    }

    record.completed = true;
    record.completedAt = new Date();
    buildProgressSnapshot(record, content);
    if (content.learningMode !== "course" && record.percentComplete === 0) {
      record.percentComplete = 100;
    }
    await record.save();

    let awardedCredits = 0;
    if (content.credits > 0) {
      user.totalCredits += content.credits;
      await user.save();
      awardedCredits = content.credits;
    }

    let certificate = await Certificate.findOne({ userId, contentId });
    if (!certificate) {
      const certificateId = crypto.randomBytes(6).toString("hex");

      certificate = await Certificate.create({
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

    return res.json({
      message: "Marked complete, credits awarded, certificate generated",
      progress: record,
      awardedCredits,
      totalCredits: user.totalCredits,
      certificateId: certificate.certificateId
    });
  } catch (error) {
    console.error("Progress error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getMyProgress = async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.user.id })
      .populate("contentId", "title discipline topic speaker contentType credits eventDate learningMode modules")
      .sort({ updatedAt: -1 });

    return res.json(progress);
  } catch (error) {
    console.error("Get progress error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
