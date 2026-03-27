const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { mockAdmin, mockStudents } = require('../utils/mockData');
const { buildCourseSelections, getTotalCoursePrice } = require('../utils/courseCatalog');
const { sendMail } = require('../utils/mailer');

// Generate JWT token
const generateToken = (userId) => {
  // Use process.env.JWT_SECRET consistently – value is set in server.js for safety
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign({ userId }, secret, {
    expiresIn: '7d'
  });
};

const buildUserResponse = (user) => ({
  id: user._id || user.id,
  email: user.email,
  role: user.role,
  firstName: user.firstName,
  lastName: user.lastName,
  enrolledCourse: user.enrolledCourse,
  selectedCourses: user.selectedCourses || [],
  courseSelections: user.courseSelections || [],
  paymentStatus: user.paymentStatus,
  amountDue: user.amountDue,
  amountPaid: user.amountPaid,
  totalCoursePrice: user.totalCoursePrice || 0,
  enrollmentDate: user.enrollmentDate,
  phone: user.phone,
  emergencyContact: user.emergencyContact,
  bio: user.bio,
  documentUrl: user.documentUrl,
  paymentMethod: user.paymentMethod || [],
  trainingMethod: user.trainingMethod || [],
  status: user.status || 'Pending Payment',
  paymentReceiptUrl: user.paymentReceiptUrl || '',
  studentIdNumber: user.studentIdNumber || '',
});

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

// Register new user
exports.register = async (req, res, next) => {
  try {
    if (global.useMockData) {
      // In mock mode, just return success with mock user
      const { email, firstName, lastName, selectedCourses, paymentMethod, trainingMethod } = req.body;
      const normalizedSelectedCourses = Array.isArray(selectedCourses) ? selectedCourses.slice(0, 4) : [];
      const courseSelections = buildCourseSelections(normalizedSelectedCourses);
      const totalCoursePrice = getTotalCoursePrice(courseSelections);
      const mockUser = {
        id: `mock-${Date.now()}`,
        email: email || 'student@alpha.com',
        role: 'student',
        firstName: firstName || 'New',
        lastName: lastName || 'Student',
        enrolledCourse: normalizedSelectedCourses[0] || 'Aviation Fundamentals & Strategy',
        selectedCourses: normalizedSelectedCourses,
        courseSelections,
        paymentStatus: 'Pending',
        amountDue: totalCoursePrice,
        amountPaid: 0,
        totalCoursePrice,
        enrollmentDate: new Date(),
        phone: '',
        emergencyContact: '',
        bio: '',
        documentUrl: '',
        studentIdNumber: `ASL-MOCK-${Date.now()}`,
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
          user: buildUserResponse(mockUser)
        }
      });
    }

    const { email, password, role, firstName, lastName, selectedCourses, paymentMethod, trainingMethod } = req.body;
    const normalizedSelectedCourses = Array.isArray(selectedCourses)
      ? [...new Set(selectedCourses.filter(Boolean))].slice(0, 4)
      : [];

    if (normalizedSelectedCourses.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one course'
      });
    }

    const courseSelections = buildCourseSelections(normalizedSelectedCourses);
    if (courseSelections.length !== normalizedSelectedCourses.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more selected courses are invalid'
      });
    }

    const totalCoursePrice = getTotalCoursePrice(courseSelections);
    const studentIdNumber = await generateStudentIdNumber();

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
      enrolledCourse: normalizedSelectedCourses[0] || '',
      selectedCourses: normalizedSelectedCourses,
      courseSelections,
      paymentStatus: 'Pending',
      amountDue: totalCoursePrice,
      enrollmentDate: new Date(),
      totalCoursePrice,
      studentIdNumber,
      paymentMethod: paymentMethod || [],
      trainingMethod: trainingMethod || [],
      status: 'Pending Payment'
    });

    // Generate token
    const token = generateToken(user._id);

    await sendMail({
      to: user.email,
      subject: 'Welcome to Alpha Step Links Aviation School',
      text: `Hello ${user.firstName || 'Student'}, welcome to Alpha Step Links Aviation School. Your student ID is ${studentIdNumber}. Kindly make your payment of NGN ${totalCoursePrice.toLocaleString('en-NG')} to begin your selected course(s): ${normalizedSelectedCourses.join(', ')}.`,
      html: `<p>Hello ${user.firstName || 'Student'},</p><p>Welcome to Alpha Step Links Aviation School.</p><p>Your student ID is <strong>${studentIdNumber}</strong>.</p><p>Please make your payment of <strong>NGN ${totalCoursePrice.toLocaleString('en-NG')}</strong> to begin your selected course(s): <strong>${normalizedSelectedCourses.join(', ')}</strong>.</p><p>We look forward to having you onboard.</p>`,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: buildUserResponse(user)
      }
    });
  } catch (error) {
    if (error.message && error.message.includes('Mailer not configured')) {
      return res.status(503).json({
        success: false,
        message: 'Mailbox delivery is not configured on the server yet. Please update SMTP settings.'
      });
    }
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
      if (email === 'admin@alpha.com' && (password === 'password123' || password === 'alphaadmin2026')) {
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
              selectedCourses: [],
              courseSelections: [],
              paymentStatus: 'Paid',
              amountDue: 0,
              amountPaid: 0,
              totalCoursePrice: 0,
              enrollmentDate: new Date(),
              phone: '',
              emergencyContact: '',
              bio: '',
              documentUrl: '',
              studentIdNumber: ''
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
              selectedCourses: mockStudent.selectedCourses || [mockStudent.enrolledCourse].filter(Boolean),
              courseSelections: mockStudent.courseSelections || [],
              paymentStatus: mockStudent.paymentStatus,
              amountDue: mockStudent.amountDue,
              amountPaid: mockStudent.amountPaid,
              totalCoursePrice: mockStudent.totalCoursePrice || mockStudent.amountDue || mockStudent.amountPaid || 0,
              enrollmentDate: mockStudent.enrollmentDate,
              phone: mockStudent.phone || '',
              emergencyContact: '',
              bio: '',
              documentUrl: '',
              paymentMethod: mockStudent.paymentMethod || [],
              trainingMethod: mockStudent.trainingMethod || [],
              status: mockStudent.status || 'Pending Payment',
              paymentReceiptUrl: mockStudent.paymentReceiptUrl || '',
              studentIdNumber: mockStudent.studentIdNumber || ''
            }
          }
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials (Mock Mode - Use: admin@alpha.com / alphaadmin2026, or student1@alpha.com / password123)'
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
        user: buildUserResponse(user)
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
            selectedCourses: mockUser.selectedCourses || [mockUser.enrolledCourse].filter(Boolean),
            courseSelections: mockUser.courseSelections || [],
            paymentStatus: mockUser.paymentStatus || 'Pending',
            amountDue: mockUser.amountDue || 0,
            amountPaid: mockUser.amountPaid || 0,
            totalCoursePrice: mockUser.totalCoursePrice || mockUser.amountDue || mockUser.amountPaid || 0,
            enrollmentDate: mockUser.enrollmentDate || new Date(),
            phone: mockUser.phone || '',
            emergencyContact: '',
            bio: '',
            documentUrl: '',
            paymentMethod: mockUser.paymentMethod || [],
            trainingMethod: mockUser.trainingMethod || [],
            status: mockUser.status || 'Pending Payment',
            paymentReceiptUrl: mockUser.paymentReceiptUrl || '',
            studentIdNumber: mockUser.studentIdNumber || '',
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
          ...buildUserResponse(user),
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.sendContactMessage = async (req, res, next) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, phone, and message'
      });
    }

    await sendMail({
      to: 'info@alphasteplinksaviationschool.com',
      replyTo: email,
      subject: `New contact enquiry from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message}`,
      html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Phone:</strong> ${phone}</p><p><strong>Message:</strong></p><p>${message}</p>`,
      required: true,
    });

    res.status(200).json({
      success: true,
      message: 'Message sent successfully'
    });
  } catch (error) {
    next(error);
  }
};
