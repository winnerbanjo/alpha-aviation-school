require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB\n");

    const totalUsers = await User.countDocuments();
    console.log(`Total users: ${totalUsers}\n`);

    const admins = await User.find({ role: "admin" }).select("-password");
    console.log(`=== ADMINS (${admins.length}) ===`);
    admins.forEach((u) => {
      console.log(`- ${u.email} | ${u.firstName} ${u.lastName} | ${u.role}`);
    });

    const students = await User.find({ role: "student" }).select("-password");
    console.log(`\n=== STUDENTS (${students.length}) ===`);
    students.forEach((u) => {
      console.log(`- ${u.email} | ${u.firstName} ${u.lastName} | Status: ${u.status} | Payment: ${u.paymentStatus}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

checkUsers();