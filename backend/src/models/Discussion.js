import mongoose from "mongoose";

const discussionSchema = new mongoose.Schema({
  contentId: { type: mongoose.Schema.Types.ObjectId, ref: "Content" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  message: String
}, { timestamps: true });

export default mongoose.model("Discussion", discussionSchema);