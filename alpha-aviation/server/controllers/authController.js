const crypto = require("crypto");
const User = require("../models/User");
const OtpSession = require("../models/OtpSession");
const jwt = require("jsonwebtoken");
const {
  buildCourseSelections,
  getTotalCoursePrice,
} = require("../utils/courseCatalog");
const { sendMail } = require("../utils/mailer");
const {
  generateOTP,
  hashOTP,
  getOTPExpiry,
  isValidOTPFormat,
  OTP_PURPOSE,
} = require("../utils/otp");

// Generate JWT token with role-based expiry
const generateToken = (userId, role = "student") => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  const expiresIn = role === "admin" ? "24h" : "7d";
  return jwt.sign({ userId, role }, secret, { expiresIn });
};

const buildUserResponse = (user) => {
  const base = {
    id: user._id || user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
  };

  // Admin gets minimal data
  if (user.role === "admin") {
    return {
      ...base,
      adminLevel: user.adminLevel || "standard",
      permissions: user.permissions || ["view", "edit"],
    };
  }

  // Student gets full profile
  return {
    ...base,
    enrolledCourse: user.enrolledCourse,
    selectedCourses: user.selectedCourses || [],
    courseSelections: user.courseSelections || [],
    paymentStatus: user.paymentStatus,
    amountDue: user.amountDue,
    amountPaid: user.amountPaid,
    totalCoursePrice: user.totalCoursePrice || 0,
    enrollmentDate: user.enrollmentDate,
    emergencyContact: user.emergencyContact,
    bio: user.bio,
    documentUrl: user.documentUrl,
    status: user.status || "active",
    paymentReceiptUrl: user.paymentReceiptUrl || "",
    studentIdNumber: user.studentIdNumber || "",
    certificateUrl: user.certificateUrl || "",
    adminClearance: user.adminClearance || false,
  };
};

const generateStudentIdNumber = async () => {
  let studentIdNumber = "";
  let exists = true;

  while (exists) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    studentIdNumber = `ASL-${new Date().getFullYear()}-${randomSuffix}`;
    exists = await User.exists({ studentIdNumber });
  }

  return studentIdNumber;
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const normalizePhone = (phone) =>
  typeof phone === "string" && phone.replace(/\D/g, "")
    ? `+${phone.replace(/\D/g, "")}`
    : "";

const isValidPhone = (phone) => {
  if (!phone) return true;
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
};

exports.register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, selectedCourses } = req.body;
    const phone = normalizePhone(req.body.phone);
    const normalizedEmail =
      typeof email === "string" ? email.toLowerCase().trim() : "";
    const mode = process.env.MODE || "production";

    // Input validation
    if (!email || !password || !selectedCourses) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and courses are required",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid phone number",
      });
    }

    const normalizedSelectedCourses = Array.isArray(selectedCourses)
      ? [...new Set(selectedCourses.filter(Boolean))].slice(0, 4)
      : [];

    if (normalizedSelectedCourses.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one course",
      });
    }

    const courseSelections = buildCourseSelections(normalizedSelectedCourses);
    if (courseSelections.length !== normalizedSelectedCourses.length) {
      return res.status(400).json({
        success: false,
        message: "One or more selected courses are invalid",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    if (mode === "production") {
      const totalCoursePrice = getTotalCoursePrice(courseSelections);
      const studentIdNumber = await generateStudentIdNumber();

      const user = await User.create({
        email: normalizedEmail,
        password,
        role: "student",
        firstName,
        lastName,
        phone,
        enrolledCourse: normalizedSelectedCourses[0] || "",
        selectedCourses: normalizedSelectedCourses,
        courseSelections,
        paymentStatus: "Pending",
        amountDue: totalCoursePrice,
        enrollmentDate: new Date(),
        totalCoursePrice,
        studentIdNumber,
        status: "active",
        isEmailVerified: false,
      });

      const token = generateToken(user._id, "student");

      return res.status(201).json({
        success: true,
        message: "Account created successfully",
        data: {
          token,
          user: buildUserResponse(user),
        },
      });
    }

    if (mode !== "development") {
      return res.status(500).json({
        success: false,
        message:
          "Server misconfiguration: set MODE=production or MODE=development in .env",
      });
    }

    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);
    const expiresAt = getOTPExpiry(10); // 10 minutes

    // Delete any existing OTP sessions for this email and purpose
    await OtpSession.deleteMany({
      email: normalizedEmail,
      purpose: OTP_PURPOSE.ENROLLMENT,
    });

    // Create OTP session
    await OtpSession.create({
      email: normalizedEmail,
      otp: hashedOTP,
      purpose: OTP_PURPOSE.ENROLLMENT,
      expiresAt,
    });

    // Send OTP email
    try {
      await sendMail({
        to: normalizedEmail,
        subject: "Verify Your Email - Alpha Step Links Aviation School",
        text: `Hello ${firstName || "Student"},\n\nYour verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.`,
        html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; padding: 40px 0;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <tr>
              <td align="center" style="background-color: #020617; padding: 40px 20px;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Alpha Step Links</h1>
                <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Aviation School</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px 40px 20px 40px;">
                <h2 style="color: #0f172a; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">Verify Your Email</h2>
                <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">Hello ${firstName || "Student"},</p>
                <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">Please use the verification code below to complete your enrollment:</p>
                <div style="background-color: #f1f5f9; padding: 32px; border-radius: 8px; margin-bottom: 32px; text-align: center;">
                  <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Verification Code</p>
                  <p style="margin: 0; color: #0061FF; font-size: 36px; font-weight: 700; letter-spacing: 8px;">${otp}</p>
                </div>
                <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">This code will expire in <strong>10 minutes</strong>.</p>
                <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin: 0;">If you didn't request this email, you can safely ignore it.</p>
              </td>
            </tr>
            <tr>
              <td style="background-color: #f1f5f9; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #64748b; font-size: 13px; margin: 0 0 8px 0;">Alpha Step Links Aviation School ensures global standards in training.</p>
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} Alpha Step Links. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </div>
        `,
      });
    } catch (mailError) {
      console.log("OTP email not sent:", mailError.message);
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email. Please try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Verification code sent to your email",
      data: {
        requiresVerification: true,
        email: normalizedEmail,
        purpose: OTP_PURPOSE.ENROLLMENT,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyEnrollmentOTP = async (req, res, next) => {
  try {
    const { email, otp, firstName, lastName, password, selectedCourses } =
      req.body;
    const phone = normalizePhone(req.body.phone);

    if (
      !email ||
      !otp ||
      !firstName ||
      !lastName ||
      !password ||
      !selectedCourses
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!isValidOTPFormat(otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP format",
      });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid phone number",
      });
    }

    // Find valid OTP session
    const otpSession = await OtpSession.findOne({
      email: email.toLowerCase().trim(),
      purpose: OTP_PURPOSE.ENROLLMENT,
      expiresAt: { $gt: new Date() },
      verified: false,
    });

    if (!otpSession) {
      return res.status(400).json({
        success: false,
        message: "OTP expired or not found. Please request a new one.",
      });
    }

    // Check attempts
    if (otpSession.attempts >= 1000) {
      await OtpSession.deleteOne({ _id: otpSession._id });
      return res.status(400).json({
        success: false,
        message: "Too many attempts. Please request a new OTP.",
      });
    }

    // Verify OTP
    const hashedOTP = hashOTP(otp);
    if (otpSession.otp !== hashedOTP) {
      otpSession.attempts += 1;
      await otpSession.save();
      return res.status(400).json({
        success: false,
        message: "Invalid verification code",
      });
    }

    // Mark OTP as verified
    otpSession.verified = true;
    await otpSession.save();

    // Process registration
    const normalizedSelectedCourses = Array.isArray(selectedCourses)
      ? [...new Set(selectedCourses.filter(Boolean))].slice(0, 4)
      : [];

    const courseSelections = buildCourseSelections(normalizedSelectedCourses);
    const totalCoursePrice = getTotalCoursePrice(courseSelections);
    const studentIdNumber = await generateStudentIdNumber();

    // Create user
    const user = await User.create({
      email: email.toLowerCase().trim(),
      password,
      role: "student",
      firstName,
      lastName,
      phone,
      enrolledCourse: normalizedSelectedCourses[0] || "",
      selectedCourses: normalizedSelectedCourses,
      courseSelections,
      paymentStatus: "Pending",
      amountDue: totalCoursePrice,
      enrollmentDate: new Date(),
      totalCoursePrice,
      studentIdNumber,
      status: "active",
      isEmailVerified: true,
    });

    // Clean up OTP session
    await OtpSession.deleteOne({ _id: otpSession._id });

    const token = generateToken(user._id, "student");

    // Send welcome email
    try {
      await sendMail({
        to: user.email,
        subject: "Welcome to Alpha Step Links Aviation School",
        text: `Hello ${user.firstName}\n\nWelcome to Alpha Step Links Aviation School.\n\nYour student ID is ${studentIdNumber}.\n\nPlease make your payment of NGN ${totalCoursePrice.toLocaleString("en-NG")} to begin your selected course(s): ${normalizedSelectedCourses.join(", ")}.\n\nWe look forward to having you onboard.`,
        html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; padding: 40px 0;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <tr>
              <td align="center" style="background-color: #020617; padding: 40px 20px;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Alpha Step Links</h1>
                <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Aviation School</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px 40px 20px 40px;">
                <h2 style="color: #0f172a; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">Welcome to the Academy</h2>
                <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">Hello ${user.firstName},</p>
                <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">Your enrollment has been successfully registered. Your official Student ID is <strong>${studentIdNumber}</strong>.</p>
                <div style="background-color: #f1f5f9; padding: 24px; border-radius: 8px; margin-bottom: 32px;">
                  <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Selected Course(s)</p>
                  <p style="margin: 0 0 16px 0; color: #0f172a; font-size: 16px; font-weight: 600;">${normalizedSelectedCourses.join(", ")}</p>
                  <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Amount Due</p>
                  <p style="margin: 0; color: #FF6B35; font-size: 24px; font-weight: 700;">NGN ${totalCoursePrice.toLocaleString("en-NG")}</p>
                </div>
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td align="center">
                      <a href="${process.env.CLIENT_URL || "https://www.aslaviationschool.co"}/login" style="background-color: #0061FF; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">Access Your Portal</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="background-color: #f1f5f9; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #64748b; font-size: 13px; margin: 0 0 8px 0;">Alpha Step Links Aviation School ensures global standards in training.</p>
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} Alpha Step Links. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </div>
        `,
      });
    } catch (mailError) {
      console.log("Welcome email not sent:", mailError.message);
    }

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        token,
        user: buildUserResponse(user),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Resend enrollment OTP
exports.resendEnrollmentOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check rate limiting - max 3 resends per 15 minutes
    const recentOtpCount = await OtpSession.countDocuments({
      email: email.toLowerCase().trim(),
      purpose: OTP_PURPOSE.ENROLLMENT,
      createdAt: { $gt: new Date(Date.now() - 15 * 60 * 1000) },
    });

    if (recentOtpCount >= 3) {
      return res.status(429).json({
        success: false,
        message:
          "Too many OTP requests. Please wait 15 minutes before trying again.",
      });
    }

    // Delete existing OTP
    await OtpSession.deleteMany({
      email: email.toLowerCase().trim(),
      purpose: OTP_PURPOSE.ENROLLMENT,
    });

    // Generate new OTP
    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);
    const expiresAt = getOTPExpiry(10);

    await OtpSession.create({
      email: email.toLowerCase().trim(),
      otp: hashedOTP,
      purpose: OTP_PURPOSE.ENROLLMENT,
      expiresAt,
    });

    // Send OTP email
    try {
      await sendMail({
        to: email,
        subject:
          "Your New Verification Code - Alpha Step Links Aviation School",
        text: `Your new verification code is: ${otp}\n\nThis code will expire in 10 minutes.`,
        html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; padding: 40px 0;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <tr>
              <td align="center" style="background-color: #020617; padding: 40px 20px;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Alpha Step Links</h1>
                <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Aviation School</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px 40px 20px 40px;">
                <h2 style="color: #0f172a; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">New Verification Code</h2>
                <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">Here is your new verification code:</p>
                <div style="background-color: #f1f5f9; padding: 32px; border-radius: 8px; margin-bottom: 32px; text-align: center;">
                  <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Verification Code</p>
                  <p style="margin: 0; color: #0061FF; font-size: 36px; font-weight: 700; letter-spacing: 8px;">${otp}</p>
                </div>
                <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0;">This code will expire in <strong>10 minutes</strong>.</p>
              </td>
            </tr>
            <tr>
              <td style="background-color: #f1f5f9; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #64748b; font-size: 13px; margin: 0 0 8px 0;">If you didn't request this email, please ignore it.</p>
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} Alpha Step Links. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </div>
        `,
      });
    } catch (mailError) {
      console.log("OTP resend email not sent:", mailError.message);
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email. Please try again.",
      });
    }

    res.status(200).json({
      success: true,
      message: "New verification code sent",
    });
  } catch (error) {
    next(error);
  }
};

// Login user - with OTP for admin
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user with password field
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // If admin, send OTP and require second factor
    if (user.role === "admin") {
      // Generate OTP
      const otp = generateOTP();
      const hashedOTP = hashOTP(otp);
      const expiresAt = getOTPExpiry(5); // 5 minutes for admin

      // Delete existing OTP sessions for this admin
      await OtpSession.deleteMany({
        email: user.email,
        purpose: OTP_PURPOSE.ADMIN_LOGIN,
      });

      // Create OTP session
      await OtpSession.create({
        email: user.email,
        otp: hashedOTP,
        purpose: OTP_PURPOSE.ADMIN_LOGIN,
        expiresAt,
      });

      // Send OTP email
      try {
        await sendMail({
          to: user.email,
          subject:
            "Admin Login Verification - Alpha Step Links Aviation School",
          text: `Hello ${user.firstName || "Admin"},\n\nYour verification code is: ${otp}\n\nThis code will expire in 5 minutes.\n\nIf you didn't request this, please ignore this mail.`,
          html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; padding: 40px 0;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              <tr>
                <td align="center" style="background-color: #020617; padding: 40px 20px;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Alpha Step Links</h1>
                  <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Aviation School</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 40px 20px 40px;">
                  <h2 style="color: #0f172a; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">Admin Login Verification</h2>
                  <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">Hello ${user.firstName || "Admin"},</p>
                  <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">A login attempt was made on your admin account. Use the code below to complete sign in:</p>
                  <div style="background-color: #f1f5f9; padding: 32px; border-radius: 8px; margin-bottom: 32px; text-align: center;">
                    <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Verification Code</p>
                    <p style="margin: 0; color: #0061FF; font-size: 36px; font-weight: 700; letter-spacing: 8px;">${otp}</p>
                  </div>
                  <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">This code will expire in <strong>5 minutes</strong>.</p>
                  <p style="color: #ef4444; font-size: 13px; line-height: 1.6; margin: 0;">If you didn't request this, please ignore this mail.</p>
                </td>
              </tr>
              <tr>
                <td style="background-color: #f1f5f9; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="color: #64748b; font-size: 13px; margin: 0 0 8px 0;">Alpha Step Links Aviation School ensures global standards in training.</p>
                  <p style="color: #94a3b8; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} Alpha Step Links. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </div>
          `,
        });
      } catch (mailError) {
        console.log("Admin OTP email not sent:", mailError.message);
        return res.status(500).json({
          success: false,
          message: "Failed to send verification code. Please try again.",
        });
      }

      // Return temp token (short-lived, just for OTP verification)
      const tempToken = jwt.sign(
        { userId: user._id, role: user.role, purpose: "otp_verification" },
        process.env.JWT_SECRET,
        { expiresIn: "10m" },
      );

      return res.status(200).json({
        success: true,
        message: "Verification code sent to your email",
        data: {
          requiresOTP: true,
          email: user.email,
          tempToken,
        },
      });
    }

    // For students, generate token directly
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: buildUserResponse(user),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Verify admin login OTP
exports.verifyAdminOTP = async (req, res, next) => {
  try {
    const { email, otp, tempToken } = req.body;

    if (!email || !otp || !tempToken) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and temp token are required",
      });
    }

    if (!isValidOTPFormat(otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP format",
      });
    }

    // Verify temp token
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
      if (decoded.purpose !== "otp_verification") {
        return res.status(401).json({
          success: false,
          message: "Invalid temporary token",
        });
      }
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Temporary token expired. Please login again.",
      });
    }

    // Find valid OTP session
    const otpSession = await OtpSession.findOne({
      email: email.toLowerCase().trim(),
      purpose: OTP_PURPOSE.ADMIN_LOGIN,
      expiresAt: { $gt: new Date() },
      verified: false,
    });

    if (!otpSession) {
      return res.status(400).json({
        success: false,
        message: "OTP expired or not found. Please login again.",
      });
    }

    // Check attempts
    if (otpSession.attempts >= 1000) {
      await OtpSession.deleteOne({ _id: otpSession._id });
      return res.status(400).json({
        success: false,
        message: "Too many attempts. Please login again.",
      });
    }

    // Verify OTP
    const hashedOTP = hashOTP(otp);
    if (otpSession.otp !== hashedOTP) {
      otpSession.attempts += 1;
      await otpSession.save();
      return res.status(400).json({
        success: false,
        message: "Invalid verification code",
      });
    }

    // Mark OTP as verified
    otpSession.verified = true;
    await otpSession.save();

    // Get user and generate full token
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Invalid user",
      });
    }

    // Clean up OTP session
    await OtpSession.deleteOne({ _id: otpSession._id });

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: buildUserResponse(user),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Resend admin login OTP
exports.resendAdminOTP = async (req, res, next) => {
  try {
    const { email, tempToken } = req.body;

    if (!email || !tempToken) {
      return res.status(400).json({
        success: false,
        message: "Email and temp token are required",
      });
    }

    // Verify temp token
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
      if (decoded.purpose !== "otp_verification") {
        return res.status(401).json({
          success: false,
          message: "Invalid temporary token",
        });
      }
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Temporary token expired. Please login again.",
      });
    }

    // Check rate limiting
    const recentOtpCount = await OtpSession.countDocuments({
      email: email.toLowerCase().trim(),
      purpose: OTP_PURPOSE.ADMIN_LOGIN,
      createdAt: { $gt: new Date(Date.now() - 15 * 60 * 1000) },
    });

    if (recentOtpCount >= 3) {
      return res.status(429).json({
        success: false,
        message:
          "Too many OTP requests. Please wait 15 minutes before trying again.",
      });
    }

    // Delete existing OTP
    await OtpSession.deleteMany({
      email: email.toLowerCase().trim(),
      purpose: OTP_PURPOSE.ADMIN_LOGIN,
    });

    // Generate new OTP
    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);
    const expiresAt = getOTPExpiry(5);

    await OtpSession.create({
      email: email.toLowerCase().trim(),
      otp: hashedOTP,
      purpose: OTP_PURPOSE.ADMIN_LOGIN,
      expiresAt,
    });

    // Send OTP email
    try {
      await sendMail({
        to: email,
        subject: "New Verification Code - Alpha Step Links Aviation School",
        text: `Your new verification code is: ${otp}\n\nThis code will expire in 5 minutes.`,
        html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; padding: 40px 0;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <tr>
              <td align="center" style="background-color: #020617; padding: 40px 20px;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Alpha Step Links</h1>
                <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Aviation School</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px 40px 20px 40px;">
                <h2 style="color: #0f172a; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">New Verification Code</h2>
                <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">Here is your new verification code:</p>
                <div style="background-color: #f1f5f9; padding: 32px; border-radius: 8px; margin-bottom: 32px; text-align: center;">
                  <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Verification Code</p>
                  <p style="margin: 0; color: #0061FF; font-size: 36px; font-weight: 700; letter-spacing: 8px;">${otp}</p>
                </div>
                <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0;">This code will expire in <strong>5 minutes</strong>.</p>
              </td>
            </tr>
            <tr>
              <td style="background-color: #f1f5f9; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #64748b; font-size: 13px; margin: 0 0 8px 0;">If you didn't request this, please secure your account.</p>
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} Alpha Step Links. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </div>
        `,
      });
    } catch (mailError) {
      console.log("Admin OTP resend email not sent:", mailError.message);
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email. Please try again.",
      });
    }

    res.status(200).json({
      success: true,
      message: "New verification code sent",
    });
  } catch (error) {
    next(error);
  }
};

// Get current user profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          ...buildUserResponse(user),
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Contact message
exports.sendContactMessage = async (req, res, next) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, phone, and message",
      });
    }

    await sendMail({
      to: "info@alphasteplinksaviationschool.com",
      replyTo: email,
      subject: `New contact enquiry from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message}`,
      html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Phone:</strong> ${phone}</p><p><strong>Message:</strong></p><p>${message}</p>`,
      required: true,
    });

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Forgot password — sends reset link email
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide your email address" });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+resetToken +resetTokenExpiry");

    // Always return success to prevent email enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If that email exists, a reset link has been sent.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save({ validateBeforeSave: false });

    const clientUrl =
      process.env.CLIENT_URL || "https://www.aslaviationschool.co";
    const resetUrl = `${clientUrl}/reset-password?token=${token}`;

    await sendMail({
      to: user.email,
      subject: "Password Reset Request — Alpha Step Links Aviation School",
      text: `Hello ${user.firstName || "Student"}\n\nPaste this link in your browser to reset your password: ${resetUrl}\n\nThis link expires in 1 hour.`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; padding: 40px 0;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <tr>
              <td align="center" style="background-color: #020617; padding: 40px 20px;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Alpha Step Links</h1>
                <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Aviation School</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px 40px 20px 40px;">
                <h2 style="color: #0f172a; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">Password Reset Request</h2>
                <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">Hello ${user.firstName || "Student"},</p>
                <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">We received a request to reset your password for your portal account. To proceed, securely click the button below to set a new password. This link will expire in <strong>1 hour</strong>.</p>
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td align="center">
                      <a href="${resetUrl}" style="background-color: #FF6B35; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">Reset Password</a>
                    </td>
                  </tr>
                </table>
                <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 32px 0 0 0;">If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="color: #0061FF; font-size: 14px; line-height: 1.5; margin: 8px 0 0 0; word-break: break-all;">${resetUrl}</p>
              </td>
            </tr>
            <tr>
              <td style="background-color: #f1f5f9; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #64748b; font-size: 13px; margin: 0 0 8px 0;">If you didn't request this email, you can safely ignore it.</p>
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} Alpha Step Links. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </div>
      `,
    });

    res.status(200).json({
      success: true,
      message: "If that email exists, a reset link has been sent.",
    });
  } catch (error) {
    next(error);
  }
};

// Reset password — validates token and sets new password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    }).select("+resetToken +resetTokenExpiry +password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or has expired",
      });
    }

    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now sign in.",
    });
  } catch (error) {
    next(error);
  }
};
