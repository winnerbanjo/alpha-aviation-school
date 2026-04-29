const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const courseSelectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    // Core auth fields
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "student"],
      default: "student",
      required: true,
    },

    // Common fields (used by both)
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },

    // Student-specific fields
    emergencyContact: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    documentUrl: {
      type: String,
      trim: true,
    },
    enrolledCourse: {
      type: String,
      trim: true,
    },
    selectedCourses: {
      type: [String],
      default: [],
      validate: {
        validator: (value) => Array.isArray(value) && value.length <= 4,
        message: "Students can enroll in at most 4 courses",
      },
    },
    courseSelections: {
      type: [courseSelectionSchema],
      default: [],
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    amountDue: {
      type: Number,
      default: 0,
      min: 0,
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCoursePrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "banned", "graduated", "suspended"],
      default: "active",
    },
    paymentReceiptUrl: {
      type: String,
      trim: true,
    },
    studentIdNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    certificateUrl: {
      type: String,
      trim: true,
    },

    // Admin-specific fields
    adminLevel: {
      type: String,
      enum: ["super", "standard"],
      default: "standard",
    },
    permissions: {
      type: [String],
      default: ["view", "edit"],
    },

    // Password reset
    resetToken: {
      type: String,
      select: false,
    },
    resetTokenExpiry: {
      type: Date,
      select: false,
    },

    // Admin clearance for student portal
    adminClearance: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
