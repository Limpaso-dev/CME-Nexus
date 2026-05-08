import mongoose from "mongoose";

const moduleProgressSchema = new mongoose.Schema(
  {
    moduleId: {
      type: String,
      required: true
    },
    secondsSpent: {
      type: Number,
      default: 0
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  { _id: false }
);

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
  moduleProgress: {
    type: [moduleProgressSchema],
    default: []
  },
  lastReadModuleId: {
    type: String,
    default: ""
  },
  engagementSeconds: {
    type: Number,
    default: 0
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
