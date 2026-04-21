require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const checkStudents = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB\n");

    const students = await User.find({ role: "student" }).select("email firstName lastName status paymentStatus");
    console.log(`=== STUDENTS (${students.length}) ===\n`);
    
    students.forEach((u) => {
      console.log(`${u.email}`);
      console.log(`  Name: ${u.firstName} ${u.lastName}`);
      console.log(`  status: "${u.status}"`);
      console.log(`  paymentStatus: "${u.paymentStatus}"`);
      console.log();
    });

    // Check for invalid status values
    const validStatuses = ['active', 'banned', 'graduated', 'suspended'];
    const invalid = students.filter(s => s.status && !validStatuses.includes(s.status));
    
    if (invalid.length > 0) {
      console.log(`⚠️ ${invalid.length} students have invalid status values!`);
      console.log(`Valid values now: ${validStatuses.join(', ')}`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

checkStudents();