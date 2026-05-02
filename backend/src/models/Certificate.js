import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Content",
    required: true
  },
  certificateId: {
    type: String,
    unique: true,
    required: true
  },
  issuedAt: {
    type: Date,
    required: true
  }
}, { timestamps: true });

certificateSchema.index({ userId: 1, issuedAt: -1 });
certificateSchema.index({ userId: 1, contentId: 1 }, { unique: true });

export default mongoose.model("Certificate", certificateSchema);
