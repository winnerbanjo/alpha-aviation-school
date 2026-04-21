const User = require('../models/User');

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

exports.createUser = async (req, res, next) => {
  try {
    const { email, password, role, firstName, lastName, phone } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and role are required'
      });
    }

    if (!['admin', 'student'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be admin or student'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const userData = {
      email,
      password,
      role,
      firstName,
      lastName,
      phone,
      status: role === 'admin' ? 'active' : 'active',
      paymentStatus: role === 'student' ? 'Pending' : undefined,
    };

    if (role === 'student') {
      userData.studentIdNumber = await generateStudentIdNumber();
    }

    const user = await User.create(userData);

    res.status(201).json({
      success: true,
      message: `${role} created successfully`,
      data: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        studentIdNumber: user.studentIdNumber || null,
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, firstName, lastName, phone, role, status, paymentStatus } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
      user.email = email;
    }

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (role && ['admin', 'student'].includes(role)) user.role = role;
    if (status && ['active', 'banned', 'graduated', 'suspended'].includes(status)) user.status = status;
    if (paymentStatus && ['Pending', 'Paid'].includes(paymentStatus)) user.paymentStatus = paymentStatus;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        status: user.status,
        paymentStatus: user.paymentStatus,
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.uploadCertificate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { certificateUrl } = req.body;

    if (!certificateUrl) {
      return res.status(400).json({
        success: false,
        message: 'Certificate URL is required'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.certificateUrl = certificateUrl;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Certificate uploaded successfully',
      data: {
        certificateUrl: user.certificateUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.bulkImportUsers = async (req, res, next) => {
  try {
    const { users } = req.body;

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No users provided'
      });
    }

    const results = {
      created: 0,
      skipped: 0,
      errors: []
    };

    for (const userData of users) {
      const { email, password, role, firstName, lastName, phone, status } = userData;

      if (!email || !password) {
        results.skipped++;
        results.errors.push(`${email || 'unknown'}: Email and password required`);
        continue;
      }

      if (password.length < 6) {
        results.skipped++;
        results.errors.push(`${email}: Password must be at least 6 characters`);
        continue;
      }

      const userRole = role?.toLowerCase() === 'admin' ? 'admin' : 'student';
      const validStatuses = ['active', 'banned', 'graduated', 'suspended'];
      const userStatus = status && validStatuses.includes(status.toLowerCase()) 
        ? status.toLowerCase() 
        : 'active';

      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        results.skipped++;
        results.errors.push(`${email}: Already exists`);
        continue;
      }

      const createData = {
        email: email.toLowerCase(),
        password,
        role: userRole,
        firstName: firstName || '',
        lastName: lastName || '',
        phone: phone || '',
        status: userStatus,
        paymentStatus: userRole === 'student' ? 'Pending' : undefined,
      };

      if (userRole === 'student') {
        createData.studentIdNumber = await generateStudentIdNumber();
      }

      await User.create(createData);

      results.created++;
    }

    res.status(200).json({
      success: true,
      message: `Import complete: ${results.created} created, ${results.skipped} skipped`,
      data: results
    });
  } catch (error) {
    next(error);
  }
};