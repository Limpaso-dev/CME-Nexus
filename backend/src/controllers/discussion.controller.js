import Discussion from "../models/Discussion.js";

export const createDiscussion = async (req, res) => {
  const { contentId, message } = req.body;

  const post = await Discussion.create({
    contentId,
    message,
    userId: req.user.id
  });

  res.json(post);
};

export const getDiscussions = async (req, res) => {
  const posts = await Discussion.find({
    contentId: req.params.contentId
  }).populate("userId", "name");

  res.json(posts);
};