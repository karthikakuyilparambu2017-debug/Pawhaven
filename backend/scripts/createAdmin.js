import "dotenv/config";
import mongoose from "mongoose";

import connectDB from "../src/config/db.js";
import User from "../src/models/User.js";
import { hashPassword } from "../src/utils/password.js";

async function createAdmin() {
  try {
    await connectDB();

    const adminName = process.env.ADMIN_NAME;
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminName || !adminEmail || !adminPassword) {
      throw new Error(
        "ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD are required in .env"
      );
    }

    const normalizedEmail = adminEmail.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      if (existingUser.role === "ADMIN") {
        console.log("Admin account already exists.");
      } else {
        console.log(
          `A user with ${normalizedEmail} already exists with role ${existingUser.role}.`
        );
      }

      await mongoose.connection.close();
      return;
    }

    const hashedPassword = await hashPassword(adminPassword);

    const admin = await User.create({
      name: adminName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "ADMIN",
      isActive: true,
    });

    console.log("");
    console.log("=================================");
    console.log("ADMIN CREATED SUCCESSFULLY");
    console.log("=================================");
    console.log(`Name:  ${admin.name}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Role:  ${admin.role}`);
    console.log("=================================");
    console.log("");

    await mongoose.connection.close();
  } catch (error) {
    console.error("Failed to create admin:", error.message);

    try {
      await mongoose.connection.close();
    } catch {}

    process.exit(1);
  }
}

createAdmin();