import mongoose from "mongoose";
import Content from "../models/Content.js";

const CONTENT_TYPES = new Set(["video", "pdf", "notes"]);
const LEARNING_MODES = new Set(["session", "course"]);

const parseBoolean = (value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    if (value.toLowerCase() === "true") {
      return true;
    }

    if (value.toLowerCase() === "false") {
      return false;
    }
  }

  return null;
};

const normalizeKeywords = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const parseModules = (value) => {
  if (value == null || value === "") {
    return [];
  }

  const rawValue = typeof value === "string" ? JSON.parse(value) : value;
  if (!Array.isArray(rawValue)) {
    throw new Error("modules must be an array");
  }

  return rawValue
    .map((module) => ({
      title: String(module.title || "").trim(),
      content: String(module.content || "").trim(),
      resourceUrl: String(module.resourceUrl || "").trim()
    }))
    .filter((module) => module.title);
};

const buildAsset = (file) => ({
  url: `/uploads/${file.filename}`,
  originalName: file.originalname,
  mimeType: file.mimetype,
  size: file.size
});

const validateContentPayload = (payload, files = {}, { partial = false } = {}) => {
  const errors = [];
  const data = {};

  const assignString = (field, { required = false } = {}) => {
    if (payload[field] == null || payload[field] === "") {
      if (required && !partial) {
        errors.push(`${field} is required`);
      }
      return;
    }

    if (typeof payload[field] !== "string") {
      errors.push(`${field} must be a string`);
      return;
    }

    data[field] = payload[field].trim();
  };

  assignString("title", { required: true });
  assignString("description");
  assignString("discipline");
  assignString("topic");
  assignString("speaker");
  assignString("summary");
  assignString("fileUrl");

  if (payload.keywords !== undefined) {
    data.keywords = normalizeKeywords(payload.keywords);
  }

  if (payload.learningMode !== undefined) {
    if (!LEARNING_MODES.has(payload.learningMode)) {
      errors.push("learningMode must be session or course");
    } else {
      data.learningMode = payload.learningMode;
    }
  } else if (!partial) {
    data.learningMode = "session";
  }

  if (payload.credits !== undefined) {
    const credits = Number(payload.credits);
    if (!Number.isFinite(credits) || credits < 0) {
      errors.push("credits must be a non-negative number");
    } else {
      data.credits = credits;
    }
  }

  if (payload.contentType !== undefined) {
    if (!CONTENT_TYPES.has(payload.contentType)) {
      errors.push("contentType must be one of video, pdf, or notes");
    } else {
      data.contentType = payload.contentType;
    }
  } else if (!partial) {
    errors.push("contentType is required");
  }

  if (payload.eventDate !== undefined && payload.eventDate !== "") {
    const eventDate = new Date(payload.eventDate);
    if (Number.isNaN(eventDate.getTime())) {
      errors.push("eventDate must be a valid date");
    } else {
      data.eventDate = eventDate;
    }
  }

  if (payload.isLiveEvent !== undefined) {
    const isLiveEvent = parseBoolean(payload.isLiveEvent);
    if (isLiveEvent === null) {
      errors.push("isLiveEvent must be true or false");
    } else {
      data.isLiveEvent = isLiveEvent;
    }
  }

  if (payload.archivedAt !== undefined) {
    if (payload.archivedAt === null || payload.archivedAt === "") {
      data.archivedAt = null;
    } else {
      const archivedAt = new Date(payload.archivedAt);
      if (Number.isNaN(archivedAt.getTime())) {
        errors.push("archivedAt must be a valid date");
      } else {
        data.archivedAt = archivedAt;
      }
    }
  }

  if (payload.modules !== undefined) {
    try {
      data.modules = parseModules(payload.modules);
    } catch {
      errors.push("modules must be valid JSON");
    }
  }

  if (files.primaryAsset?.[0]) {
    data.primaryAsset = buildAsset(files.primaryAsset[0]);
  }

  if (files.attachments?.length) {
    data.attachments = files.attachments.map(buildAsset);
  }

  return { errors, data };
};

const buildContentQuery = (query) => {
  const filters = {};
  const {
    search,
    discipline,
    topic,
    speaker,
    contentType,
    learningMode,
    dateFrom,
    dateTo,
    creditsMin,
    creditsMax,
    archived
  } = query;

  if (discipline) {
    filters.discipline = new RegExp(`^${discipline.trim()}$`, "i");
  }

  if (topic) {
    filters.topic = new RegExp(topic.trim(), "i");
  }

  if (speaker) {
    filters.speaker = new RegExp(speaker.trim(), "i");
  }

  if (contentType && CONTENT_TYPES.has(contentType)) {
    filters.contentType = contentType;
  }

  if (learningMode && LEARNING_MODES.has(learningMode)) {
    filters.learningMode = learningMode;
  }

  if (search) {
    filters.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { topic: { $regex: search, $options: "i" } },
      { speaker: { $regex: search, $options: "i" } },
      { summary: { $regex: search, $options: "i" } },
      { keywords: { $elemMatch: { $regex: search, $options: "i" } } },
      { "modules.title": { $regex: search, $options: "i" } },
      { "modules.content": { $regex: search, $options: "i" } }
    ];
  }

  if (dateFrom || dateTo) {
    filters.eventDate = {};

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      if (!Number.isNaN(fromDate.getTime())) {
        filters.eventDate.$gte = fromDate;
      }
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      if (!Number.isNaN(toDate.getTime())) {
        filters.eventDate.$lte = toDate;
      }
    }

    if (Object.keys(filters.eventDate).length === 0) {
      delete filters.eventDate;
    }
  }

  if (creditsMin || creditsMax) {
    filters.credits = {};

    if (creditsMin !== undefined && creditsMin !== "") {
      const min = Number(creditsMin);
      if (Number.isFinite(min)) {
        filters.credits.$gte = min;
      }
    }

    if (creditsMax !== undefined && creditsMax !== "") {
      const max = Number(creditsMax);
      if (Number.isFinite(max)) {
        filters.credits.$lte = max;
      }
    }

    if (Object.keys(filters.credits).length === 0) {
      delete filters.credits;
    }
  }

  if (archived === "true") {
    filters.archivedAt = { $ne: null };
  }

  if (archived === "false") {
    filters.archivedAt = null;
  }

  return filters;
};

const parseSort = (sortParam) => {
  switch (sortParam) {
    case "title":
      return { title: 1 };
    case "credits":
      return { credits: -1, createdAt: -1 };
    case "eventDate":
      return { eventDate: -1, createdAt: -1 };
    default:
      return { createdAt: -1 };
  }
};

const validateModeSpecificRequirements = (content) => {
  if (content.learningMode === "course" && content.modules.length === 0) {
    return "Course content requires at least one module";
  }

  if (
    content.learningMode !== "course" &&
    !content.fileUrl &&
    !content.primaryAsset &&
    content.attachments.length === 0
  ) {
    return "Session content requires a file upload, attachment, or external URL";
  }

  if (content.isLiveEvent && !content.eventDate) {
    return "eventDate is required for live CME events";
  }

  return null;
};

export const createContent = async (req, res) => {
  try {
    const { errors, data } = validateContentPayload(req.body, req.files || {});

    if (errors.length > 0) {
      return res.status(400).json({ message: "Invalid content payload", errors });
    }

    const content = new Content({
      ...data,
      createdBy: req.user.id,
      archivedAt: data.isLiveEvent ? null : data.archivedAt ?? null
    });

    const modeError = validateModeSpecificRequirements(content);
    if (modeError) {
      return res.status(400).json({ message: modeError });
    }

    await content.save();
    return res.status(201).json(content);
  } catch (err) {
    console.error("Create content error:", err);
    return res.status(500).json({ message: "Failed to create content" });
  }
};

export const getAllContent = async (req, res) => {
  try {
    const filters = buildContentQuery(req.query);
    const sort = parseSort(req.query.sort);
    const limit = Math.min(Number(req.query.limit) || 50, 100);

    const data = await Content.find(filters)
      .populate("createdBy", "name email")
      .sort(sort)
      .limit(limit);

    return res.json(data);
  } catch (err) {
    console.error("Fetch content error:", err);
    return res.status(500).json({ message: "Failed to fetch content" });
  }
};

export const getSingleContent = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid content id" });
    }

    const content = await Content.findById(req.params.id)
      .populate("createdBy", "name email");

    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    return res.json(content);
  } catch (err) {
    console.error("Get single content error:", err);
    return res.status(500).json({ message: "Failed to fetch content" });
  }
};

export const updateContent = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid content id" });
    }

    const { errors, data } = validateContentPayload(req.body, req.files || {}, { partial: true });
    if (errors.length > 0) {
      return res.status(400).json({ message: "Invalid content payload", errors });
    }

    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    const newAttachments = data.attachments;
    delete data.attachments;

    Object.assign(content, data);

    if (newAttachments?.length) {
      content.attachments = [...content.attachments, ...newAttachments];
    }

    if (content.isLiveEvent) {
      content.archivedAt = null;
    }

    const modeError = validateModeSpecificRequirements(content);
    if (modeError) {
      return res.status(400).json({ message: modeError });
    }

    await content.save();
    return res.json(content);
  } catch (err) {
    console.error("Update content error:", err);
    return res.status(500).json({ message: "Failed to update content" });
  }
};

export const deleteContent = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid content id" });
    }

    const content = await Content.findByIdAndDelete(req.params.id);
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    return res.json({ message: "Content deleted successfully" });
  } catch (err) {
    console.error("Delete content error:", err);
    return res.status(500).json({ message: "Failed to delete content" });
  }
};
