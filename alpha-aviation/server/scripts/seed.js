const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../models/User');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create Admin user
    const adminPassword = await bcrypt.hash('password123', 10);
    const admin = await User.create({
      email: 'admin@alpha.com',
      password: adminPassword,
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      enrolledCourse: '',
      paymentStatus: 'Paid',
      amountDue: 0,
      enrollmentDate: new Date()
    });
    console.log('✅ Admin user created:', admin.email);

    // Create Student 1 - Aviation Fundamentals
    const student1Password = await bcrypt.hash('password123', 10);
    const student1 = await User.create({
      email: 'student1@alpha.com',
      password: student1Password,
      role: 'student',
      firstName: 'John',
      lastName: 'Doe',
      enrolledCourse: 'Aviation Fundamentals & Strategy',
      paymentStatus: 'Pending',
      amountDue: 5000,
      enrollmentDate: new Date('2024-01-15')
    });
    console.log('✅ Student 1 created:', student1.email);

    // Create Student 2 - Cabin Crew
    const student2Password = await bcrypt.hash('password123', 10);
    const student2 = await User.create({
      email: 'student2@alpha.com',
      password: student2Password,
      role: 'student',
      firstName: 'Jane',
      lastName: 'Smith',
      enrolledCourse: 'Elite Cabin Crew & Safety Operations',
      paymentStatus: 'Pending',
      amountDue: 7500,
      enrollmentDate: new Date('2024-02-01')
    });
    console.log('✅ Student 2 created:', student2.email);

    // Create Student 3 - Travel & Tourism
    const student3Password = await bcrypt.hash('password123', 10);
    const student3 = await User.create({
      email: 'student3@alpha.com',
      password: student3Password,
      role: 'student',
      firstName: 'Michael',
      lastName: 'Johnson',
      enrolledCourse: 'Travel & Tourism Management',
      paymentStatus: 'Paid',
      amountDue: 0,
      enrollmentDate: new Date('2024-01-20')
    });
    console.log('✅ Student 3 created:', student3.email);

    // Create Student 4 - Customer Service
    const student4Password = await bcrypt.hash('password123', 10);
    const student4 = await User.create({
      email: 'student4@alpha.com',
      password: student4Password,
      role: 'student',
      firstName: 'Sarah',
      lastName: 'Williams',
      enrolledCourse: 'Airline Customer Service & Passenger Handling',
      paymentStatus: 'Pending',
      amountDue: 6000,
      enrollmentDate: new Date('2024-02-10')
    });
    console.log('✅ Student 4 created:', student4.email);

    // Create Student 5 - Safety & Security
    const student5Password = await bcrypt.hash('password123', 10);
    const student5 = await User.create({
      email: 'student5@alpha.com',
      password: student5Password,
      role: 'student',
      firstName: 'David',
      lastName: 'Brown',
      enrolledCourse: 'Aviation Safety & Security Awareness',
      paymentStatus: 'Pending',
      amountDue: 5500,
      enrollmentDate: new Date('2024-02-15')
    });
    console.log('✅ Student 5 created:', student5.email);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin: admin@alpha.com / password123');
    console.log('Student 1: student1@alpha.com / password123');
    console.log('Student 2: student2@alpha.com / password123');
    console.log('Student 3: student3@alpha.com / password123');
    console.log('Student 4: student4@alpha.com / password123');
    console.log('Student 5: student5@alpha.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
