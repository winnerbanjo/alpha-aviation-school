const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { mockAdmin, mockStudents } = require('../utils/mockData');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'alpha_secret_2026_vision', {
    expiresIn: '7d'
  });
};

// Register new user
exports.register = async (req, res, next) => {
  try {
    if (global.useMockData) {
      // In mock mode, just return success with mock user
      const { email, firstName, lastName, enrolledCourse, paymentMethod, trainingMethod } = req.body;
      const mockUser = {
        id: `mock-${Date.now()}`,
        email: email || 'student@alpha.com',
        role: 'student',
        firstName: firstName || 'New',
        lastName: lastName || 'Student',
        enrolledCourse: enrolledCourse || 'Aviation Fundamentals & Strategy',
        paymentStatus: 'Pending',
        amountDue: 5000,
        amountPaid: 0,
        enrollmentDate: new Date(),
        phone: '',
        emergencyContact: '',
        bio: '',
        documentUrl: '',
        paymentMethod: paymentMethod || [],
        trainingMethod: trainingMethod || [],
        status: 'Pending Payment',
        paymentReceiptUrl: ''
      };

      const token = generateToken(mockUser.id);

      return res.status(201).json({
        success: true,
        message: 'User registered successfully (Mock Mode)',
        data: {
          token,
          user: mockUser
        }
      });
    }

    const { email, password, role, firstName, lastName, enrolledCourse, amountDue, paymentMethod, trainingMethod } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      role: role || 'student',
      firstName,
      lastName,
      enrolledCourse: enrolledCourse || '',
      paymentStatus: 'Pending',
      amountDue: amountDue || 0,
      enrollmentDate: new Date(),
      paymentMethod: paymentMethod || [],
      trainingMethod: trainingMethod || [],
      status: 'Pending Payment'
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          enrolledCourse: user.enrolledCourse,
          paymentStatus: user.paymentStatus,
          amountDue: user.amountDue,
          enrollmentDate: user.enrollmentDate,
          phone: user.phone,
          emergencyContact: user.emergencyContact,
          bio: user.bio,
          documentUrl: user.documentUrl,
          amountPaid: user.amountPaid,
          paymentMethod: user.paymentMethod || [],
          trainingMethod: user.trainingMethod || [],
          status: user.status || 'Pending Payment',
          paymentReceiptUrl: user.paymentReceiptUrl || ''
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Mock mode login
    if (global.useMockData) {
      // Check for admin
      if (email === 'admin@alpha.com' && password === 'password123') {
        const token = generateToken(mockAdmin._id);
        return res.status(200).json({
          success: true,
          message: 'Login successful (Mock Mode)',
          data: {
            token,
            user: {
              id: mockAdmin._id,
              email: mockAdmin.email,
              role: mockAdmin.role,
              firstName: mockAdmin.firstName,
              lastName: mockAdmin.lastName,
              enrolledCourse: '',
              paymentStatus: 'Paid',
              amountDue: 0,
              amountPaid: 0,
              enrollmentDate: new Date(),
              phone: '',
              emergencyContact: '',
              bio: '',
              documentUrl: ''
            }
          }
        });
      }

      // Check for mock students
      const mockStudent = mockStudents.find(s => s.email === email);
      if (mockStudent && password === 'password123') {
        const token = generateToken(mockStudent._id);
        return res.status(200).json({
          success: true,
          message: 'Login successful (Mock Mode)',
          data: {
            token,
            user: {
              id: mockStudent._id,
              email: mockStudent.email,
              role: 'student',
              firstName: mockStudent.firstName,
              lastName: mockStudent.lastName,
              enrolledCourse: mockStudent.enrolledCourse,
              paymentStatus: mockStudent.paymentStatus,
              amountDue: mockStudent.amountDue,
              amountPaid: mockStudent.amountPaid,
              enrollmentDate: mockStudent.enrollmentDate,
              phone: mockStudent.phone || '',
              emergencyContact: '',
              bio: '',
              documentUrl: '',
              paymentMethod: mockStudent.paymentMethod || [],
              trainingMethod: mockStudent.trainingMethod || [],
              status: mockStudent.status || 'Pending Payment',
              paymentReceiptUrl: mockStudent.paymentReceiptUrl || ''
            }
          }
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials (Mock Mode - Use: admin@alpha.com or student1@alpha.com / password123)'
      });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          enrolledCourse: user.enrolledCourse,
          paymentStatus: user.paymentStatus,
          amountDue: user.amountDue,
          enrollmentDate: user.enrollmentDate,
          phone: user.phone,
          emergencyContact: user.emergencyContact,
          bio: user.bio,
          documentUrl: user.documentUrl,
          amountPaid: user.amountPaid,
          paymentMethod: user.paymentMethod || [],
          trainingMethod: user.trainingMethod || [],
          status: user.status || 'Pending Payment',
          paymentReceiptUrl: user.paymentReceiptUrl || ''
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get current user profile
exports.getProfile = async (req, res, next) => {
  try {
    if (global.useMockData) {
      // Return mock admin or first student based on token
      const userId = req.user?.userId || 'mock-admin';
      let mockUser = mockAdmin;
      
      if (userId.includes('mock') && userId !== 'mock-admin') {
        mockUser = mockStudents.find(s => s._id === userId) || mockStudents[0];
      }

      return res.status(200).json({
        success: true,
        data: {
          user: {
            id: mockUser._id,
            email: mockUser.email,
            role: mockUser.role || 'student',
            firstName: mockUser.firstName,
            lastName: mockUser.lastName,
            enrolledCourse: mockUser.enrolledCourse || '',
            paymentStatus: mockUser.paymentStatus || 'Pending',
            amountDue: mockUser.amountDue || 0,
            amountPaid: mockUser.amountPaid || 0,
            enrollmentDate: mockUser.enrollmentDate || new Date(),
            phone: mockUser.phone || '',
            emergencyContact: '',
            bio: '',
            documentUrl: '',
            paymentMethod: mockUser.paymentMethod || [],
            trainingMethod: mockUser.trainingMethod || [],
            status: mockUser.status || 'Pending Payment',
            paymentReceiptUrl: mockUser.paymentReceiptUrl || '',
            createdAt: new Date()
          }
        }
      });
    }

    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          enrolledCourse: user.enrolledCourse,
          paymentStatus: user.paymentStatus,
          amountDue: user.amountDue,
          enrollmentDate: user.enrollmentDate,
          phone: user.phone,
          emergencyContact: user.emergencyContact,
          bio: user.bio,
          documentUrl: user.documentUrl,
          amountPaid: user.amountPaid,
          paymentMethod: user.paymentMethod || [],
          trainingMethod: user.trainingMethod || [],
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
