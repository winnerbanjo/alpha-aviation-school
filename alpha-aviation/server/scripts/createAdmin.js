const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../models/User');

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@alphasteplinks.com' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await User.create({
      email: 'admin@alphasteplinks.com',
      password: hashedPassword,
      role: 'Admin',
      firstName: 'Admin',
      lastName: 'User'
    });

    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@alphasteplinks.com');
    console.log('Password: admin123');
    console.log('Role: Admin');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdmin();
