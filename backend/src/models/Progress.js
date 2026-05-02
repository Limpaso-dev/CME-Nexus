import mongoose from "mongoose";

const progressSchema = new mongoose.Schema({
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
  completed: {
    type: Boolean,
    default: false
  },
  completedModuleIds: {
    type: [String],
    default: []
  },
  lastReadModuleId: {
    type: String,
    default: ""
  },
  percentComplete: {
    type: Number,
    default: 0
  },
  completedAt: Date
}, { timestamps: true });

progressSchema.index({ userId: 1, contentId: 1 }, { unique: true });
progressSchema.index({ userId: 1, completed: 1, updatedAt: -1 });

export default mongoose.model("Progress", progressSchema);
