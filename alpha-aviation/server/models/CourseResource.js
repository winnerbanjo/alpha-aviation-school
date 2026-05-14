const mongoose = require("mongoose");

const courseResourceSchema = new mongoose.Schema(
  {
    courseTitle: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    type: {
      type: String,
      enum: ["pdf", "video", "doc", "link", "other"],
      default: "other",
    },
    size: {
      type: String,
      trim: true,
      default: "",
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

courseResourceSchema.index({ courseTitle: 1, createdAt: -1 });

module.exports = mongoose.model("CourseResource", courseResourceSchema);
