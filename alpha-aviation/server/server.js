const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = 'alphaadmin2026';
process.env.JWT_SECRET = JWT_SECRET;

// Models / auth utilities
const User = require('./models/User');
const { buildCourseSelections, getTotalCoursePrice } = require('./utils/courseCatalog');

// Import routes
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');

// Import error handler
const errorHandler = require('./middleware/errorHandler');

// Initialize Express app
const app = express();

const allowedOrigins = [
  'https://www.aslaviationschool.co',
  'https://aslaviationschool.co',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Global flag to track DB connection status
global.dbConnected = false;
global.useMockData = false;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => res.send('Server is Up'));

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('Validating token for:', req.headers.authorization);
    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      if (global.useMockData) {
        req.user = {
          ...decoded,
          role: decoded.role || (String(decoded.userId || '').includes('admin') ? 'admin' : 'student')
        };
        return next();
      }

      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      req.user = {
        ...decoded,
        role: user.role,
        email: user.email
      };
      return next();
    } catch (error) {
      console.error('Token verification failed');
      return res.status(401).json({ message: 'Not authorized' });
    }
  }

  return res.status(401).json({ message: 'No token provided' });
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Admin only' });
};

app.get('/api/admin', protect, admin, (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      email: req.user.email || 'admin@alpha.com',
      role: req.user.role
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', protect, admin, adminRoutes);
app.use('/api/student', studentRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    dbConnected: global.dbConnected,
    mode: global.useMockData ? 'mock' : 'database'
  });
});

// Simple keep-alive ping route
app.get('/api/ping', (req, res) => {
  res.json({ status: 'awake' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Temporary: seed admin user on startup to ensure portal access (new Render DB)
const seedAdmin = async () => {
  try {
    const adminEmail = 'admin@alpha.com';
    const existingAdmin = await User.findOne({ email: adminEmail }).select('+password');
    if (!existingAdmin) {
      await User.create({
        firstName: 'Master',
        lastName: 'Admin',
        email: adminEmail,
        password: 'alphaadmin2026',
        role: 'admin',
      });
      console.log('✅ DATABASE SEEDED: Admin account created.');
      return;
    }

    // Keep admin credentials synchronized for production recovery.
    const hasExpectedPassword = await existingAdmin.comparePassword('alphaadmin2026');
    const needsRoleFix = existingAdmin.role !== 'admin';

    if (!hasExpectedPassword || needsRoleFix) {
      existingAdmin.password = 'alphaadmin2026';
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log('✅ DATABASE SYNCED: Admin credentials repaired.');
    }
  } catch (err) {
    console.error('❌ Seeding Error:', err);
  }
};

const clearDemoStudents = async () => {
  try {
    const demoStudentEmails = [
      'student1@alpha.com',
      'student2@alpha.com',
      'student3@alpha.com',
      'student4@alpha.com',
      'student5@alpha.com',
    ];
    const result = await User.deleteMany({
      role: 'student',
      email: { $in: demoStudentEmails },
    });
    if (result.deletedCount > 0) {
      console.log(`✅ DATABASE CLEANUP: Removed ${result.deletedCount} demo students.`);
    }
  } catch (err) {
    console.error('❌ Demo Cleanup Error:', err);
  }
};

const generateStudentIdNumber = async () => {
  let studentIdNumber = '';
  let exists = true;

  while (exists) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    studentIdNumber = `ASL-${new Date().getFullYear()}-${randomSuffix}`;
    exists = await User.exists({ studentIdNumber });
  }

  return studentIdNumber;
};

const repairStudentRecords = async () => {
  try {
    const students = await User.find({ role: 'student' });
    let repairedCount = 0;

    for (const student of students) {
      let changed = false;

      const normalizedSelectedCourses = Array.isArray(student.selectedCourses) && student.selectedCourses.length > 0
        ? [...new Set(student.selectedCourses.filter(Boolean))].slice(0, 4)
        : [student.enrolledCourse].filter(Boolean);

      if (
        normalizedSelectedCourses.length > 0 &&
        JSON.stringify(normalizedSelectedCourses) !== JSON.stringify(student.selectedCourses || [])
      ) {
        student.selectedCourses = normalizedSelectedCourses;
        changed = true;
      }

      const computedCourseSelections = buildCourseSelections(normalizedSelectedCourses);
      const currentCourseSelections = Array.isArray(student.courseSelections) ? student.courseSelections : [];
      if (
        computedCourseSelections.length > 0 &&
        JSON.stringify(computedCourseSelections) !== JSON.stringify(currentCourseSelections)
      ) {
        student.courseSelections = computedCourseSelections;
        changed = true;
      }

      const computedTotalCoursePrice = getTotalCoursePrice(computedCourseSelections);
      if (computedTotalCoursePrice > 0 && computedTotalCoursePrice !== (student.totalCoursePrice || 0)) {
        student.totalCoursePrice = computedTotalCoursePrice;
        changed = true;
      }

      if (computedTotalCoursePrice > 0) {
        if (student.paymentStatus === 'Paid') {
          if ((student.amountPaid || 0) === 0) {
            student.amountPaid = computedTotalCoursePrice;
            changed = true;
          }
          if ((student.amountDue || 0) !== 0) {
            student.amountDue = 0;
            changed = true;
          }
        } else if ((student.amountDue || 0) === 0) {
          student.amountDue = computedTotalCoursePrice;
          changed = true;
        }
      }

      if (!student.studentIdNumber) {
        student.studentIdNumber = await generateStudentIdNumber();
        changed = true;
      }

      if (changed) {
        await student.save();
        repairedCount += 1;
      }
    }

    if (repairedCount > 0) {
      console.log(`DATABASE REPAIR: Updated ${repairedCount} student record(s).`);
    }
  } catch (err) {
    console.error('Student Repair Error:', err);
  }
};

// Connect to MongoDB with aggressive settings
const connectDB = async () => {
  const atlasURI = process.env.MONGODB_URI;
  const localURI = 'mongodb://localhost:27017/alpha_aviation';
  
  // Ensure database name is alpha_aviation for Atlas
  let finalAtlasURI = atlasURI;
  if (atlasURI && atlasURI.includes('mongodb+srv://')) {
    // Parse and ensure alpha_aviation database
    try {
      const url = new URL(atlasURI);
      // Replace database name if it exists, or add it
      if (url.pathname && url.pathname !== '/') {
        finalAtlasURI = atlasURI.replace(/\/[^/?]+(\?|$)/, '/alpha_aviation$1');
      } else {
        finalAtlasURI = atlasURI.replace(/\?/, '/alpha_aviation?').replace(/\/alpha_aviation\?/, '/alpha_aviation?');
        if (!finalAtlasURI.includes('/alpha_aviation')) {
          finalAtlasURI = atlasURI + (atlasURI.includes('?') ? '&' : '/alpha_aviation?');
        }
      }
    } catch (e) {
      // If URL parsing fails, try simple string replacement
      if (!atlasURI.includes('/alpha_aviation')) {
        finalAtlasURI = atlasURI.replace(/\?/, '/alpha_aviation?');
      }
    }
  }
  
  // Connection options – keep serverSelectionTimeout low to avoid hanging when DB is slow
  const connectionOptions = {
    serverSelectionTimeoutMS: 5000, // 5 second timeout
    tlsAllowInvalidCertificates: true, // Allow invalid TLS certificates
    dbName: 'alpha_aviation'
  };
  
  // Try Atlas first
  if (finalAtlasURI && finalAtlasURI !== 'undefined') {
    try {
      const conn = await mongoose.connect(finalAtlasURI, connectionOptions);
      console.log('🛫 FLIGHT DECK CONNECTED');
      global.dbConnected = true;
      global.useMockData = false;
      await seedAdmin();
      await clearDemoStudents();
      await repairStudentRecords();
      return;
    } catch (error) {
      console.log('⚠️  Atlas connection failed, trying local MongoDB...');
      console.log('   Error:', error.message);
    }
  }
  
  // Try local MongoDB
  try {
    const conn = await mongoose.connect(localURI, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
    });
    console.log('🛫 FLIGHT DECK CONNECTED (Local)');
    global.dbConnected = true;
    global.useMockData = false;
    await seedAdmin();
    await clearDemoStudents();
    await repairStudentRecords();
    return;
  } catch (error) {
    console.log('⚠️  Local MongoDB connection failed, using Mock Data mode');
    console.log('📝 Note: Install MongoDB locally or fix Atlas connection to use real data');
    global.dbConnected = false;
    global.useMockData = true;
  }
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    if (global.useMockData) {
      console.log('📊 Running in MOCK DATA mode - All features available with sample data');
    }
  });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Don't exit if using mock data
  if (!global.useMockData) {
    process.exit(1);
  }
});

startServer();

module.exports = app;
