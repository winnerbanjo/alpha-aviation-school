const crypto = require("crypto");

/**
 * Generate a 6-digit numeric OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Hash OTP for storage
 */
const hashOTP = (otp) => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

/**
 * Create OTP expiry date
 * @param {number} minutes - Minutes until expiry (default: 10)
 */
const getOTPExpiry = (minutes = 10) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

/**
 * Validate OTP format
 */
const isValidOTPFormat = (otp) => {
  return /^\d{6}$/.test(otp);
};

/**
 * Get OTP purpose based on context
 */
const OTP_PURPOSE = {
  ENROLLMENT: "enrollment",
  ADMIN_LOGIN: "admin_login",
};

module.exports = {
  generateOTP,
  hashOTP,
  getOTPExpiry,
  isValidOTPFormat,
  OTP_PURPOSE,
};
