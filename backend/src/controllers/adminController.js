import {
  getAdminStats,
  listAllUsers,
  findUserById,
  createNewUser,
  updateExistingUser,
  removeUser,
} from "../services/adminService.js";
import { sendAccountCreatedEmail } from "../services/emailService.js";

// ======================================================
// ADMIN DASHBOARD STATS
// ======================================================

export async function stats(req, res, next) {
  try {
    const dashboardStats = await getAdminStats();

    res.status(200).json({
      success: true,
      stats: dashboardStats,
    });
  } catch (error) {
    next(error);
  }
}

// ======================================================
// GET ALL USERS
// ======================================================

export async function getAllUsers(req, res, next) {
  try {
    const users = await listAllUsers();

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
}

// ======================================================
// GET ONE USER
// ======================================================

export async function getUserById(req, res, next) {
  try {
    const user = await findUserById(
      req.params.id
    );

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
}

// ======================================================
// CREATE USER
// ======================================================

export async function createUser(req, res, next) {
  try {
    const user = await createNewUser(
      req.body
    );

    // Email the login details to the new employee.
    // If the email fails, the account still exists, and the admin is told.
    let emailSent = true;
    try {
      await sendAccountCreatedEmail(
        {
          name: user.name || req.body.name,
          email: user.email || req.body.email,
          role: user.role || req.body.role,
        },
        req.body.password
      );
    } catch (err) {
      emailSent = false;
      console.error("Account email failed:", err.message);
    }

    res.status(201).json({
      success: true,
      message: "User created successfully",
      emailSent,
      user,
    });
  } catch (error) {
    next(error);
  }
}


// ======================================================
// UPDATE USER
// ======================================================

export async function updateUser(req, res, next) {
  try {
    const user = await updateExistingUser(
      req.params.id,
      req.body,
      req.user
    );

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
}

// ======================================================
// DELETE USER
// ======================================================

export async function deleteUser(req, res, next) {
  try {
    await removeUser(
      req.params.id,
      req.user
    );

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}