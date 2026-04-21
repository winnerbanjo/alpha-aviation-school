require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const checkAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const admin = await User.findOne({ email: "emmanuelferrum003@gmail.com" });
    if (!admin) {
      console.log("Admin not found!");
      process.exit(1);
    }

    console.log("Admin found:");
    console.log("- Email:", admin.email);
    console.log("- Role:", admin.role);
    console.log("- FirstName:", admin.firstName);
    console.log("- LastName:", admin.lastName);
    console.log("- Has password:", !!admin.password);

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

checkAdmin();