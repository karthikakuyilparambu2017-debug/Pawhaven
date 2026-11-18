import "dotenv/config";
import mongoose from "mongoose";

import connectDB from "../src/config/db.js";
import Suite from "../src/models/Suite.js";

const suites = [
  {
    name: "Standard Suite 1",
    description: "A clean, comfortable room for a short stay.",
    type: "STANDARD",
    capacity: 1,
    pricePerDay: 500,
    amenities: ["Air conditioning", "Daily cleaning", "Soft bedding"],
  },
  {
    name: "Standard Suite 2",
    description: "Same comfort as Suite 1, a little more floor space.",
    type: "STANDARD",
    capacity: 2,
    pricePerDay: 700,
    amenities: ["Air conditioning", "Daily cleaning", "Soft bedding"],
  },
  {
    name: "Premium Suite 1",
    description: "A roomy suite with extra play time and a window view.",
    type: "PREMIUM",
    capacity: 1,
    pricePerDay: 900,
    amenities: ["Air conditioning", "Play area", "Window view", "Webcam"],
  },
  {
    name: "Premium Suite 2",
    description: "Premium comfort for two pets sharing a room.",
    type: "PREMIUM",
    capacity: 2,
    pricePerDay: 1300,
    amenities: ["Air conditioning", "Play area", "Window view", "Webcam"],
  },
  {
    name: "VIP Suite 1",
    description: "Our best room, with private play time and extra attention.",
    type: "VIP",
    capacity: 1,
    pricePerDay: 1500,
    amenities: ["Air conditioning", "Private play area", "Webcam", "Grooming session", "Daily photo updates"],
  },
  {
    name: "VIP Suite 2",
    description: "A large VIP suite for two pets from the same family.",
    type: "VIP",
    capacity: 2,
    pricePerDay: 2200,
    amenities: ["Air conditioning", "Private play area", "Webcam", "Grooming session", "Daily photo updates"],
  },
];

async function seedSuites() {
  try {
    await connectDB();

    let added = 0;
    for (const suite of suites) {
      const exists = await Suite.findOne({ name: suite.name });
      if (exists) {
        console.log(`Skipped (already exists): ${suite.name}`);
        continue;
      }
      await Suite.create({ ...suite, isAvailable: true });
      console.log(`Added: ${suite.name}`);
      added += 1;
    }

    console.log(`\nDone. ${added} suite(s) added.`);
    await mongoose.connection.close();
  } catch (error) {
    console.error("Failed to add suites:", error.message);
    try {
      await mongoose.connection.close();
    } catch {}
    process.exit(1);
  }
}

seedSuites();