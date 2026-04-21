require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB\n");

    // Delete user with this email if exists
    await User.deleteOne({ email: "emmanuelferrum003@gmail.com" });
    console.log("Deleted existing user (if any)");

    // Delete ALL admins
    await User.deleteMany({ role: "admin" });
    console.log("Deleted all admins\n");

    // Create new admin
    const admin = new User({
      email: "emmanuelferrum003@gmail.com",
      password: "Ferrum003",
      firstName: "Emmanuel",
      lastName: "Ferinco",
      role: "admin",
      adminLevel: "super",
      permissions: ["view", "edit", "delete", "manage"]
    });

    await admin.save();
    console.log(`Admin created:`);
    console.log(`- Email: ${admin.email}`);
    console.log(`- Name: ${admin.firstName} ${admin.lastName}`);
    console.log(`- Role: ${admin.role}`);
    console.log(`- Admin Level: ${admin.adminLevel}`);

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

createAdmin();