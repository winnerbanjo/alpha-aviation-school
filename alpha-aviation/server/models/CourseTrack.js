const mongoose = require("mongoose");

const courseTrackSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    courseTitle: {
      type: String,
      required: true,
      trim: true,
    },
    coursePrice: {
      type: Number,
      default: 0,
    },

    // 4-week window anchored to paymentConfirmedAt
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },

    // Admin-adjustable per-week progress (0–100 each)
    week1Progress: { type: Number, default: 0, min: 0, max: 100 },
    week2Progress: { type: Number, default: 0, min: 0, max: 100 },
    week3Progress: { type: Number, default: 0, min: 0, max: 100 },
    week4Progress: { type: Number, default: 0, min: 0, max: 100 },

    // Stored overall progress (recomputed on every admin update)
    overallProgress: { type: Number, default: 0, min: 0, max: 100 },

    status: {
      type: String,
      enum: ["active", "completed", "expired"],
      default: "active",
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// One track per student-course pair
courseTrackSchema.index({ student: 1, courseTitle: 1 }, { unique: true });
// Efficient "expiring soon" queries
courseTrackSchema.index({ endDate: 1, status: 1 });

module.exports = mongoose.model("CourseTrack", courseTrackSchema);
