import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  contentId: { type: mongoose.Schema.Types.ObjectId, ref: "Content" },
  certificateId: { type: String, unique: true },
  issuedAt: Date
});

export default mongoose.model("Certificate", certificateSchema);