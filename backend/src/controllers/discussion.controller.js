import mongoose from "mongoose";
import Content from "../models/Content.js";
import Discussion from "../models/Discussion.js";

export const createDiscussion = async (req, res) => {
  try {
    const { contentId, message } = req.body;

    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      return res.status(400).json({ message: "Invalid content id" });
    }

    if (!message?.trim()) {
      return res.status(400).json({ message: "message is required" });
    }

    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    const post = await Discussion.create({
      contentId,
      message: message.trim(),
      userId: req.user.id
    });

    const populatedPost = await post.populate("userId", "name role");

    return res.status(201).json(populatedPost);
  } catch (error) {
    console.error("Create discussion error:", error);
    return res.status(500).json({ message: "Failed to create discussion" });
  }
};

export const getDiscussions = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.contentId)) {
      return res.status(400).json({ message: "Invalid content id" });
    }

    const posts = await Discussion.find({
      contentId: req.params.contentId
    })
      .populate("userId", "name role")
      .sort({ createdAt: -1 });

    return res.json(posts);
  } catch (error) {
    console.error("Get discussions error:", error);
    return res.status(500).json({ message: "Failed to fetch discussions" });
  }
};
