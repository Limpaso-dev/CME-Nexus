import mongoose from "mongoose";

const discussionSchema = new mongoose.Schema({
  contentId: { type: mongoose.Schema.Types.ObjectId, ref: "Content" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Discussion",
    default: null
  },
  message: String
}, { timestamps: true });

discussionSchema.index({ contentId: 1, parentId: 1, createdAt: -1 });

export default mongoose.model("Discussion", discussionSchema);
