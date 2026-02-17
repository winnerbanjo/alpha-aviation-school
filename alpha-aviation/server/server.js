const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

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
  'https://aslaviationschool.co'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS Policy Block'), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.options('*', cors());

// Global flag to track DB connection status
global.dbConnected = false;
global.useMockData = false;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler (must be last)
app.use(errorHandler);

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
  
  // Aggressive connection options
  const connectionOptions = {
    serverSelectionTimeoutMS: 45000, // 45 second timeout
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
      return;
    } catch (error) {
      console.log('⚠️  Atlas connection failed, trying local MongoDB...');
      console.log('   Error:', error.message);
    }
  }
  
  // Try local MongoDB
  try {
    const conn = await mongoose.connect(localURI, {
      serverSelectionTimeoutMS: 45000, // 45 second timeout
    });
    console.log('🛫 FLIGHT DECK CONNECTED (Local)');
    global.dbConnected = true;
    global.useMockData = false;
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
