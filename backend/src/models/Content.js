import mongoose from "mongoose";

const contentSchema = new mongoose.Schema({
  title: String,
  description: String,
  discipline: String,
  topic: String,
  speaker: String,
  fileUrl: String,
  credits: Number,
  contentType: { type: String, enum: ["video", "pdf", "notes"] },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.model("Content", contentSchema);