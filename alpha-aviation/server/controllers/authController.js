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
        text: `Hello ${user.firstName || "Student"}, welcome to Alpha Step Links Aviation School. Your student ID is ${studentIdNumber}. Kindly make your payment of NGN ${totalCoursePrice.toLocaleString("en-NG")} to begin your selected course(s): ${normalizedSelectedCourses.join(", ")}.`,
        html: `<p>Hello ${user.firstName || "Student"},</p><p>Welcome to Alpha Step Links Aviation School.</p><p>Your student ID is <strong>${studentIdNumber}</strong>.</p><p>Please make your payment of <strong>NGN ${totalCoursePrice.toLocaleString("en-NG")}</strong> to begin your selected course(s): <strong>${normalizedSelectedCourses.join(", ")}</strong>.</p><p>We look forward to having you onboard.</p>`,
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
