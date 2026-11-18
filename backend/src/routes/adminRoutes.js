import express from "express";
import { body, param } from "express-validator";

import {
  stats,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/adminController.js";

import { protect, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";

const router = express.Router();


// ADMIN DASHBOARD STATS
router.get(
  "/stats",
  protect,
  authorize("ADMIN"),
  stats
);


// GET ALL USERS
router.get(
  "/users",
  protect,
  authorize("ADMIN"),
  getAllUsers
);


// GET ONE USER


router.get(
  "/users/:id",
  protect,
  authorize("ADMIN"),
  [
    param("id")
      .isMongoId()
      .withMessage("Invalid user ID"),
  ],
  validate,
  getUserById
);

//CREATE USER

router.post(
  "/users",
  protect,
  authorize("ADMIN"),
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 2, max: 100 })
      .withMessage("Name must be between 2 and 100 characters"),

    body("email")
      .trim()
      .isEmail()
      .withMessage("Please provide a valid email")
      .normalizeEmail(),

    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
     body("role")
      .isIn([
        "PET_OWNER",
        "STAFF",
        "VETERINARIAN",
        "ADMIN",
      ])
      .withMessage("Invalid user role"),
  ],
  validate,
  createUser
);  

// UPDATE USER
router.patch(
  "/users/:id",
  protect,
  authorize("ADMIN"),
  [
    param("id")
      .isMongoId()
      .withMessage("Invalid user ID"),

    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Name cannot be empty"),

    body("email")
      .optional()
      .trim()
      .isEmail()
      .withMessage("Please provide a valid email")
      .normalizeEmail(),

    body("role")
      .optional()
      .isIn([
        "PET_OWNER",
        "STAFF",
        "VETERINARIAN",
        "ADMIN",
      ])
      .withMessage("Invalid user role"),

    body("isActive")
      .optional()
      .isBoolean()
      .withMessage("isActive must be true or false"),
  ],
  validate,
  updateUser
);

// DELETE USER
router.delete(
  "/users/:id",
  protect,
  authorize("ADMIN"),
  [
    param("id")
      .isMongoId()
      .withMessage("Invalid user ID"),
  ],
  validate,
  deleteUser
);

export default router;