import crypto from "crypto";
import mongoose from "mongoose";
import Certificate from "../models/Certificate.js";
import Content from "../models/Content.js";
import Progress from "../models/Progress.js";
import User from "../models/User.js";
import { generateCertificate } from "../utils/generateCertificate.js";

const MAX_TRACKED_SECONDS_PER_REQUEST = 30;

const clampTrackedSeconds = (value) => {
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return 0;
  }

  return Math.min(Math.round(seconds), MAX_TRACKED_SECONDS_PER_REQUEST);
};

const getSessionRequirementSeconds = (content) =>
  Math.max(1, Number(content.minCompletionMinutes) || 10) * 60;

const getModuleRequirementSeconds = (module) =>
  Math.max(1, Number(module.estimatedMinutes) || 5) * 60;

const getOrCreateModuleProgress = (record, moduleId) => {
  let moduleProgress = record.moduleProgress.find((entry) => entry.moduleId === moduleId);

  if (!moduleProgress) {
    record.moduleProgress.push({
      moduleId,
      secondsSpent: 0,
      completed: false,
      completedAt: null
    });
    moduleProgress = record.moduleProgress.find((entry) => entry.moduleId === moduleId);
  }

  return moduleProgress;
};

const syncCompletedModuleIds = (record) => {
  record.completedModuleIds = record.moduleProgress
    .filter((entry) => entry.completed)
    .map((entry) => entry.moduleId);
};

const buildProgressSnapshot = (record, content) => {
  const moduleCount = content.modules.length;
  let percentComplete = 0;

  if (moduleCount > 0) {
    syncCompletedModuleIds(record);
    const totalProgress = content.modules.reduce((sum, module) => {
      const moduleProgress = record.moduleProgress.find(
        (entry) => entry.moduleId === String(module._id)
      );
      const requiredSeconds = getModuleRequirementSeconds(module);
      const ratio = moduleProgress
        ? Math.min(moduleProgress.secondsSpent / requiredSeconds, 1)
        : 0;

      return sum + ratio;
    }, 0);

    percentComplete = Math.round((totalProgress / moduleCount) * 100);
  } else {
    const requiredSeconds = getSessionRequirementSeconds(content);
    percentComplete = record.completed
      ? 100
      : Math.round((Math.min(record.engagementSeconds / requiredSeconds, 1)) * 100);
  }

  record.percentComplete = percentComplete;
  return record;
};

const rejectAdminTracking = (req, res) => {
  if (req.user?.role === "admin") {
    res.status(403).json({
      message: "Admins can view content, but learner progress is not tracked for admin accounts"
    });
    return true;
  }

  return false;
};

export const markModuleRead = async (req, res) => {
  try {
    if (rejectAdminTracking(req, res)) {
      return;
    }

    const { contentId, moduleId, seconds } = req.body;
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

    const trackedSeconds = clampTrackedSeconds(seconds || 15);
    if (!trackedSeconds) {
      return res.status(400).json({ message: "A valid engagement duration is required" });
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

    const currentModule = content.modules.find((module) => String(module._id) === moduleId);
    const requiredSeconds = getModuleRequirementSeconds(currentModule);
    const moduleProgress = getOrCreateModuleProgress(record, moduleId);

    if (!moduleProgress.completed) {
      moduleProgress.secondsSpent = Math.min(
        moduleProgress.secondsSpent + trackedSeconds,
        requiredSeconds
      );

      if (moduleProgress.secondsSpent >= requiredSeconds) {
        moduleProgress.completed = true;
        moduleProgress.completedAt = moduleProgress.completedAt || new Date();
      }
    }

    record.lastReadModuleId = moduleId;
    syncCompletedModuleIds(record);
    buildProgressSnapshot(record, content);
    await record.save();

    return res.json({
      message: moduleProgress.completed
        ? "Module learning requirement completed"
        : "Module engagement tracked",
      progress: record
    });
  } catch (error) {
    console.error("Module progress error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const trackEngagement = async (req, res) => {
  try {
    if (rejectAdminTracking(req, res)) {
      return;
    }

    const { contentId, seconds } = req.body;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      return res.status(400).json({ message: "Invalid content id" });
    }

    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    const trackedSeconds = clampTrackedSeconds(seconds || 15);
    if (!trackedSeconds) {
      return res.status(400).json({ message: "A valid engagement duration is required" });
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

    if (content.learningMode !== "course") {
      const requiredSeconds = getSessionRequirementSeconds(content);
      record.engagementSeconds = Math.min(
        record.engagementSeconds + trackedSeconds,
        requiredSeconds
      );
    }

    buildProgressSnapshot(record, content);
    await record.save();

    return res.json({
      message: "Learning engagement tracked",
      progress: record
    });
  } catch (error) {
    console.error("Track engagement error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const markComplete = async (req, res) => {
  try {
    if (rejectAdminTracking(req, res)) {
      return;
    }

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
    } else {
      const requiredSeconds = getSessionRequirementSeconds(content);
      if (record.engagementSeconds < requiredSeconds) {
        buildProgressSnapshot(record, content);

        return res.status(400).json({
          message: "Spend more time with this learning material before marking it complete",
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
    record.percentComplete = 100;
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
    if (req.user?.role === "admin") {
      return res.json([]);
    }

    const progress = await Progress.find({ userId: req.user.id })
      .populate("contentId", "title discipline topic speaker contentType credits eventDate learningMode modules")
      .sort({ updatedAt: -1 });

    return res.json(progress);
  } catch (error) {
    console.error("Get progress error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
