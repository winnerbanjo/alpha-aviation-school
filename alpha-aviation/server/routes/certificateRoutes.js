const express = require("express");
const rateLimit = require("express-rate-limit");
const certificateController = require("../controllers/certificateController");

const router = express.Router();

// Public verification: generous enough for employers checking a handful of
// certificates, tight enough to make enumerating the registry impractical.
const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: {
    success: false,
    message: "Too many verification requests. Please try again in a few minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const lookupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Too many lookups. Please try again in a few minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get("/verify/:code", verifyLimiter, certificateController.verifyCertificate);
router.post("/lookup", lookupLimiter, certificateController.lookupCertificate);

module.exports = router;
