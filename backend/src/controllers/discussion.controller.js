import mongoose from "mongoose";
import Content from "../models/Content.js";
import Discussion from "../models/Discussion.js";

const buildDiscussionTree = (posts) => {
  const nodes = posts.map((post) => ({
    ...post.toObject(),
    replies: []
  }));

  const byId = new Map(nodes.map((node) => [String(node._id), node]));
  const roots = [];

  for (const node of nodes) {
    if (node.parentId) {
      const parent = byId.get(String(node.parentId));
      if (parent) {
        parent.replies.push(node);
        continue;
      }
    }

    roots.push(node);
  }

  const sortReplies = (items) => {
    items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    items.forEach((item) => sortReplies(item.replies));
  };

  sortReplies(roots);
  return roots.reverse();
};

export const createDiscussion = async (req, res) => {
  try {
    if (req.user?.role === "admin") {
      return res.status(403).json({
        message: "Admins can review discussions, but posting is disabled for admin accounts"
      });
    }

    const { contentId, message, parentId } = req.body;

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

    let normalizedParentId = null;
    if (parentId != null && parentId !== "") {
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        return res.status(400).json({ message: "Invalid parent discussion id" });
      }

      const parentPost = await Discussion.findOne({
        _id: parentId,
        contentId
      });

      if (!parentPost) {
        return res.status(404).json({ message: "Parent discussion not found" });
      }

      normalizedParentId = parentPost._id;
    }

    const post = await Discussion.create({
      contentId,
      parentId: normalizedParentId,
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
      .sort({ createdAt: 1 });

    return res.json(buildDiscussionTree(posts));
  } catch (error) {
    console.error("Get discussions error:", error);
    return res.status(500).json({ message: "Failed to fetch discussions" });
  }
};
