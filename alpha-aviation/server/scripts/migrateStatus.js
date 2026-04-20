require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB\n");

    // Map old status to new status
    const oldToNew = {
      'Pending Payment': 'active',
      'Payment Received': 'active',
      'Active': 'active',
      'Completed': 'graduated'
    };

    const students = await User.find({ role: "student" });
    let migrated = 0;

    for (const student of students) {
      if (student.status && oldToNew[student.status]) {
        student.status = oldToNew[student.status];
        await student.save();
        migrated++;
        console.log(`Migrated ${student.email}: ${oldToNew[student.status]}`);
      }
    }

    console.log(`\n✓ Migrated ${migrated} students`);

    // Verify
    console.log(`\n=== AFTER ===`);
    const updated = await User.find({ role: "student" }).select("email status paymentStatus");
    updated.forEach(u => console.log(`${u.email}: status="${u.status}", paymentStatus="${u.paymentStatus}"`));

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

migrate();