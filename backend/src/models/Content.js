import mongoose from "mongoose";

const assetSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true
    },
    originalName: {
      type: String,
      default: ""
    },
    mimeType: {
      type: String,
      default: ""
    },
    size: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

const moduleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      default: "",
      trim: true
    },
    resourceUrl: {
      type: String,
      default: "",
      trim: true
    }
  },
  { timestamps: false }
);

const contentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      trim: true,
      default: ""
    },

    discipline: {
      type: String,
      trim: true,
      index: true
    },

    topic: {
      type: String,
      trim: true,
      index: true
    },

    speaker: {
      type: String,
      trim: true,
      index: true
    },

    summary: {
      type: String,
      trim: true,
      default: ""
    },

    keywords: {
      type: [String],
      default: [],
      set: (values) => {
        if (!Array.isArray(values)) {
          return [];
        }

        return values
          .map((value) => String(value).trim())
          .filter(Boolean);
      }
    },

    eventDate: {
      type: Date,
      index: true
    },

    learningMode: {
      type: String,
      enum: ["session", "course"],
      default: "session",
      index: true
    },

    fileUrl: {
      type: String,
      default: "",
      trim: true
    },

    primaryAsset: {
      type: assetSchema,
      default: null
    },

    attachments: {
      type: [assetSchema],
      default: []
    },

    modules: {
      type: [moduleSchema],
      default: []
    },

    credits: {
      type: Number,
      default: 0,
      min: 0
    },

    contentType: {
      type: String,
      enum: ["video", "pdf", "notes"],
      required: true
    },

    isLiveEvent: {
      type: Boolean,
      default: false
    },

    archivedAt: {
      type: Date,
      default: null
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

/**
 * 🔎 Indexes for performance
 */
contentSchema.index({
  title: "text",
  description: "text",
  topic: "text",
  speaker: "text",
  summary: "text",
  "modules.title": "text",
  "modules.content": "text",
  keywords: "text"
});
contentSchema.index({ discipline: 1, contentType: 1, eventDate: -1 });
contentSchema.index({ createdBy: 1, createdAt: -1 });

export default mongoose.model("Content", contentSchema);
