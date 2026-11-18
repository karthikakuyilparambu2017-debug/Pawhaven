import express from "express";
import { body, param } from "express-validator";

import {
  createSuite,
  getSuites,
  getSuite,
  updateSuite,
  deleteSuite,
} from "../controllers/suiteController.js";

import {
  protect,
  authorize,
} from "../middlewares/auth.js";

import { validate } from "../middlewares/validate.js";

const router = express.Router();


// ======================================================
// GET ALL SUITES
// ======================================================

router.get(
  "/",
  protect,
  getSuites
);


// ======================================================
// GET ONE SUITE
// ======================================================

router.get(
  "/:id",
  protect,
  [
    param("id")
      .isMongoId()
      .withMessage("Invalid suite ID"),
  ],
  validate,
  getSuite
);


// ======================================================
// CREATE SUITE
// ======================================================

router.post(
  "/",
  protect,
  authorize("ADMIN"),
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage(
        "Suite name is required"
      )
      .isLength({ max: 100 })
      .withMessage(
        "Suite name cannot exceed 100 characters"
      ),

    body("description")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage(
        "Description cannot exceed 1000 characters"
      ),

    body("type")
      .isIn([
        "STANDARD",
        "PREMIUM",
        "VIP",
      ])
      .withMessage(
        "Invalid suite type"
      ),

    body("capacity")
      .isInt({ min: 1 })
      .withMessage(
        "Capacity must be at least 1"
      ),

    body("pricePerDay")
      .isFloat({ min: 0 })
      .withMessage(
        "Price per day must be 0 or greater"
      ),

    body("amenities")
      .optional()
      .isArray()
      .withMessage(
        "Amenities must be an array"
      ),

    body("amenities.*")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage(
        "Each amenity cannot exceed 100 characters"
      ),

    body("image")
      .optional()
      .isURL()
      .withMessage(
        "Image must be a valid URL"
      ),

    body("isAvailable")
      .optional()
      .isBoolean()
      .withMessage(
        "isAvailable must be true or false"
      ),
  ],
  validate,
  createSuite
);


// ======================================================
// UPDATE SUITE
// ======================================================

router.put(
  "/:id",
  protect,
  authorize("ADMIN"),
  [
    param("id")
      .isMongoId()
      .withMessage(
        "Invalid suite ID"
      ),

    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage(
        "Suite name cannot be empty"
      )
      .isLength({ max: 100 })
      .withMessage(
        "Suite name cannot exceed 100 characters"
      ),

    body("description")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage(
        "Description cannot exceed 1000 characters"
      ),

    body("type")
      .optional()
      .isIn([
        "STANDARD",
        "PREMIUM",
        "VIP",
      ])
      .withMessage(
        "Invalid suite type"
      ),

    body("capacity")
      .optional()
      .isInt({ min: 1 })
      .withMessage(
        "Capacity must be at least 1"
      ),

    body("pricePerDay")
      .optional()
      .isFloat({ min: 0 })
      .withMessage(
        "Price per day must be 0 or greater"
      ),

    body("amenities")
      .optional()
      .isArray()
      .withMessage(
        "Amenities must be an array"
      ),

    body("amenities.*")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage(
        "Each amenity cannot exceed 100 characters"
      ),

    body("image")
      .optional()
      .isURL()
      .withMessage(
        "Image must be a valid URL"
      ),

    body("isAvailable")
      .optional()
      .isBoolean()
      .withMessage(
        "isAvailable must be true or false"
      ),
  ],
  validate,
  updateSuite
);


// ======================================================
// DELETE SUITE
// ======================================================

router.delete(
  "/:id",
  protect,
  authorize("ADMIN"),
  [
    param("id")
      .isMongoId()
      .withMessage(
        "Invalid suite ID"
      ),
  ],
  validate,
  deleteSuite
);


// ======================================================
// EXPORT ROUTER
// ======================================================

export default router;