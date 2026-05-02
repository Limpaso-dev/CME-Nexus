import mongoose from "mongoose";

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  contentId: { type: mongoose.Schema.Types.ObjectId, ref: "Content" },
  completed: { type: Boolean, default: false },
  completedAt: Date
}, { timestamps: true });

export default mongoose.model("Progress", progressSchema);