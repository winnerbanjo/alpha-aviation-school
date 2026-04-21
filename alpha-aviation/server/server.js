require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");

// Models / utilities
const User = require("./models/User");

// Routes
const authRoutes = require("./routes/authRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const studentRoutes = require("./routes/studentRoutes");

// Error handler
const errorHandler = require("./middleware/errorHandler");

// Mock mode - disabled by default, enable only for local dev via .env
global.useMockData = process.env.USE_MOCK_DATA === 'true';

const app = express();

const allowedOrigins = [
  "https://www.aslaviationschool.co",
  "https://aslaviationschool.co",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Rate limiting - strict for auth, moderate for admin API
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: { success: false, message: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const adminApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window for legitimate admin use
  message: { success: false, message: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => res.send("Server is Up"));

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(401).json({ message: "Not authorized" });
      }

      req.user = {
        ...decoded,
        role: user.role,
        email: user.email,
      };

      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  } else {
    return res.status(401).json({ message: "No token provided" });
  }
};

const admin = (req, res, next) => {
  if (req.user?.role === "admin") return next();
  return res.status(403).json({ message: "Admin only" });
};

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminApiLimiter, protect, admin, adminRoutes);
app.use("/api/student", studentRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server running",
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(errorHandler);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ DB connection failed:", error.message);
    process.exit(1);
  }
};

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();

module.exports = app;
