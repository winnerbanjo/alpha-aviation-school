const mongoose = require("mongoose");

const signatorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    title: { type: String, trim: true },
    organisation: { type: String, trim: true },
  },
  { _id: false },
);

const eventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "issued",
        "reissued",
        "superseded",
        "revoked",
        "reinstated",
        "downloaded",
        "emailed",
        "email_failed",
      ],
      required: true,
    },
    at: { type: Date, default: Date.now },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    actorEmail: { type: String, trim: true },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false },
);

const certificateSchema = new mongoose.Schema(
  {
    // Human-readable registry number printed on the certificate, e.g. ASL-CRT-2026-00042
    serial: { type: String, required: true, unique: true, trim: true },
    // Unguessable code encoded in the QR and printed beside it; the public verification key
    verificationCode: { type: String, required: true, unique: true, trim: true },

    type: {
      type: String,
      enum: ["completion", "achievement", "participation"],
      default: "completion",
      required: true,
    },

    recipient: {
      fullName: { type: String, required: true, trim: true, maxlength: 80 },
      // Accent- and punctuation-free lowercase form used for duplicate checks and surname lookup
      nameKey: { type: String, required: true, index: true },
      email: { type: String, trim: true, lowercase: true },
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
        index: true,
      },
      studentIdNumber: { type: String, trim: true },
    },

    programmes: {
      type: [String],
      validate: {
        validator: (value) => Array.isArray(value) && value.length >= 1 && value.length <= 8,
        message: "A certificate needs between 1 and 8 programmes",
      },
    },

    // Stored at 00:00 UTC; always formatted in UTC so the printed day never shifts
    completionDate: { type: Date, required: true },
    issueDate: { type: Date, required: true, default: Date.now },
    deliveryMode: {
      type: String,
      enum: ["online", "in_person", "hybrid"],
      default: "online",
      required: true,
    },

    // Snapshot of the template at issue time so later template edits never alter issued records
    signatories: { type: [signatorySchema], default: [] },
    templateVersion: { type: String, required: true },

    status: {
      type: String,
      enum: ["active", "revoked", "superseded"],
      default: "active",
      index: true,
    },
    revocation: {
      at: { type: Date, default: null },
      by: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      reason: { type: String, trim: true },
    },
    supersedes: { type: mongoose.Schema.Types.ObjectId, ref: "Certificate", default: null },
    supersededBy: { type: mongoose.Schema.Types.ObjectId, ref: "Certificate", default: null },
    reissueReason: { type: String, trim: true },

    batchId: { type: String, trim: true, index: true },
    idempotencyKey: { type: String, trim: true, unique: true, sparse: true },

    // HMAC-SHA256 over the printed fields; detects edits made outside the application
    signature: { type: String, required: true },
    signatureKeyId: { type: String, required: true },

    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    stats: {
      verifications: { type: Number, default: 0 },
      lastVerifiedAt: { type: Date, default: null },
      downloads: { type: Number, default: 0 },
      lastDownloadedAt: { type: Date, default: null },
    },

    delivery: {
      emailStatus: {
        type: String,
        enum: ["not_requested", "sent", "failed"],
        default: "not_requested",
      },
      emailedAt: { type: Date, default: null },
    },

    events: { type: [eventSchema], default: [] },
  },
  { timestamps: true },
);

certificateSchema.index({ issueDate: -1 });
certificateSchema.index({ status: 1, issueDate: -1 });
certificateSchema.index({ "recipient.email": 1 });

module.exports = mongoose.model("Certificate", certificateSchema);
