import User from "../models/User.js";
import Pet from "../models/Pet.js";
import Booking from "../models/Booking.js";
import Suite from "../models/Suite.js";
import AppError from "../utils/appError.js";
import { hashPassword } from "../utils/password.js";

// ======================================================
// ADMIN DASHBOARD STATS
// ======================================================

export async function getAdminStats() {
  const [users, pets, bookings, suites] = await Promise.all([
    User.countDocuments(),
    Pet.countDocuments(),
    Booking.countDocuments(),
    Suite.countDocuments(),
  ]);

  return {
    users,
    pets,
    bookings,
    suites,
  };
}

// ======================================================
// GET ALL USERS
// ======================================================

export async function listAllUsers() {
  const users = await User.find()
    .select("-password -resetPasswordToken -resetPasswordExpires")
    .sort({ createdAt: -1 });

  return users;
}

// ======================================================
// GET ONE USER
// ======================================================

export async function findUserById(userId) {
  const user = await User.findById(userId)
    .select("-password -resetPasswordToken -resetPasswordExpires");
  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
}

// ======================================================
// CREATE USER
// ======================================================

export async function createNewUser(data) {
  const {
    name,
    email,
    password,
    role,
  } = data;

  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    throw new AppError(
      "Email already registered",
      409
    );
  }

  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role,
  });

  const safeUser = await User.findById(user._id)
    .select("-password -resetPasswordToken -resetPasswordExpires");

  return safeUser;
}

// ======================================================
// UPDATE USER
// ======================================================

export async function updateExistingUser(
  userId,
  data,
  currentAdmin
) {
  const {
    name,
    email,
    role,
    isActive,
  } = data;

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(
      "User not found",
      404
    );
  }

  // Prevent admin from deactivating themselves
  if (
    user._id.toString() === currentAdmin._id.toString() &&
    isActive === false
  ) {
    throw new AppError(
      "You cannot deactivate your own admin account",
      400
    );
  }

  // Prevent admin from changing their own role
  if (
    user._id.toString() === currentAdmin._id.toString() &&
    role !== undefined &&
    role !== "ADMIN"
  ) {
    throw new AppError(
      "You cannot change your own admin role",
      400
    );
  }

  // Update name
  if (name !== undefined) {
    user.name = name.trim();
  }

  // Update email
  if (email !== undefined) {
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: user._id },
    });

    if (existingUser) {
      throw new AppError(
        "Email already registered",
        409
      );
    }

    user.email = normalizedEmail;
  }

  // Update role
  if (role !== undefined) {
    user.role = role;
  }

  // Update active status
  if (isActive !== undefined) {
    user.isActive = isActive;
  }

  await user.save();

  const safeUser = await User.findById(user._id)
    .select("-password -resetPasswordToken -resetPasswordExpires");

  return safeUser;
}

// ======================================================
// DELETE USER
// ======================================================

export async function removeUser(
  userId,
  currentAdmin
) {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(
      "User not found",
      404
    );
  }

  // Prevent admin from deleting themselves
  if (
    user._id.toString() ===
    currentAdmin._id.toString()
  ) {
    throw new AppError(
      "You cannot delete your own admin account",
      400
    );
  }

  await User.findByIdAndDelete(userId);

  return user;
}