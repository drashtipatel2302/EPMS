const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dns = require("dns");
require("dotenv").config();

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const UserModel = require("./models/UserModel");

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      family: 4,
    });

    console.log("MongoDB Connected ✅");

    // ⚠ Optional: Remove old users
    await UserModel.deleteMany();
    console.log("Old users deleted");

    const hashedPassword = await bcrypt.hash("123456", 10);

    // 🔥 ADD YOUR OWN EMPLOYEE DATA HERE
    await UserModel.insertMany([
      {
        name: "Drashti Patel",
        email: "drashti@epms.com",
        password: hashedPassword,
        employeeId: "EMP001",
        department: "HR",
        designation: "HR Manager",
        role: "HR",
        isActive: true,
      },
      {
        name: "Rahul Sharma",
        email: "rahul@epms.com",
        password: hashedPassword,
        employeeId: "EMP002",
        department: "IT",
        designation: "Project Manager",
        role: "MANAGER",
        isActive: true,
      },
      {
        name: "Neha Singh",
        email: "neha@epms.com",
        password: hashedPassword,
        employeeId: "EMP003",
        department: "IT",
        designation: "Software Developer",
        role: "EMPLOYEE",
        isActive: true,
      },
      {
        name: "System Admin",
        email: "admin@epms.com",
        password: hashedPassword,
        employeeId: "EMP000",
        department: "Management",
        designation: "Super Administrator",
        role: "SUPER_ADMIN",
        isActive: true,
      }
    ]);

    console.log("🎉 EPMS Users Inserted Successfully!");
    process.exit();

  } catch (error) {
    console.error("Seeder Error:", error.message);
    process.exit(1);
  }
};

seedData();