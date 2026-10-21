const mongoose = require("mongoose");

// Atomic sequence store. Each document is one named counter, e.g.
// "certificate-2026", incremented with $inc so concurrent issuers never
// receive the same number.
const counterSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 },
  },
  { versionKey: false },
);

module.exports = mongoose.model("Counter", counterSchema);
