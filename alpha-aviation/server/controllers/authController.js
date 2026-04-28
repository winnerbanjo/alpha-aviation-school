const crypto = require("crypto");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const {
  buildCourseSelections,
  getTotalCoursePrice,
} = require("../utils/courseCatalog");
const { sendMail } = require("../utils/mailer");

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
    paymentMethod: user.paymentMethod || [],
    trainingMethod: user.trainingMethod || [],
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

// Register new user
exports.register = async (req, res, next) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      selectedCourses,
      paymentMethod,
      trainingMethod,
    } = req.body;

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

    const totalCoursePrice = getTotalCoursePrice(courseSelections);
    const studentIdNumber = await generateStudentIdNumber();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      role: "student",
      firstName,
      lastName,
      enrolledCourse: normalizedSelectedCourses[0] || "",
      selectedCourses: normalizedSelectedCourses,
      courseSelections,
      paymentStatus: "Pending",
      amountDue: totalCoursePrice,
      enrollmentDate: new Date(),
      totalCoursePrice,
      studentIdNumber,
      paymentMethod: paymentMethod || [],
      trainingMethod: trainingMethod || [],
      status: "active",
    });

    const token = generateToken(user._id, "student");

    // Try to send welcome email, but don't fail if it doesn't work
    try {
      await sendMail({
        to: user.email,
        subject: "Welcome to Alpha Step Links Aviation School",
        text: `Hello ${user.firstName || "Student"}\n\nWelcome to Alpha Step Links Aviation School.\n\nYour student ID is ${studentIdNumber}.\n\nPlease make your payment of NGN ${totalCoursePrice.toLocaleString("en-NG")} to begin your selected course(s): ${normalizedSelectedCourses.join(", ")}.\n\nWe look forward to having you onboard.`,
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
                <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">Hello ${user.firstName || "Student"},</p>
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
      message: "User registered successfully",
      data: {
        token,
        user: buildUserResponse(user),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login user - standard auth flow
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

    // Generate token with role-based expiry
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
