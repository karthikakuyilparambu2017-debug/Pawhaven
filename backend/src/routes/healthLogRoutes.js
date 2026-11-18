import express from "express";
import { body, param } from "express-validator";

import {
  addHealthLog,
  getHealthLogs,
  getOneHealthLog,
  editHealthLog,
  deleteHealthLog,
} from "../controllers/healthLogController.js";

import {
  protect,
  authorize,
} from "../middlewares/auth.js";

import { validate } from "../middlewares/validate.js";

const router = express.Router();


// ======================================================
// GET ALL HEALTH RECORDS FOR A PET
// ======================================================

router.get(
  "/pet/:petId",
  protect,
  [
    param("petId")
      .isMongoId()
      .withMessage("Invalid pet ID"),
  ],
  validate,
  getHealthLogs
);


// ======================================================
// GET ONE HEALTH RECORD
// ======================================================

router.get(
  "/:id",
  protect,
  [
    param("id")
      .isMongoId()
      .withMessage("Invalid health record ID"),
  ],
  validate,
  getOneHealthLog
);


// ======================================================
// CREATE HEALTH RECORD
// ======================================================

router.post(
  "/",
  protect,
  authorize("VETERINARIAN", "ADMIN"),
  [
    // Pet
    body("pet")
      .isMongoId()
      .withMessage("Valid pet ID is required"),

    // Booking - optional
    body("booking")
      .optional({ nullable: true })
      .isMongoId()
      .withMessage("Valid booking ID is required"),

    // Visit date
    body("visitDate")
      .optional()
      .isISO8601()
      .withMessage("Valid visit date is required"),

    // Diagnosis
    body("diagnosis")
      .notEmpty()
      .withMessage("Diagnosis is required")
      .trim()
      .isLength({ max: 2000 })
      .withMessage(
        "Diagnosis cannot exceed 2000 characters"
      ),

    // Symptoms
    body("symptoms")
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage(
        "Symptoms cannot exceed 2000 characters"
      ),

    // Treatment
    body("treatment")
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage(
        "Treatment cannot exceed 2000 characters"
      ),

    // Medicines
    body("medicines")
      .optional()
      .isArray()
      .withMessage(
        "Medicines must be an array"
      ),

    body("medicines.*.name")
      .if(body("medicines").exists())
      .notEmpty()
      .withMessage(
        "Medicine name is required"
      )
      .trim()
      .isLength({ max: 200 })
      .withMessage(
        "Medicine name cannot exceed 200 characters"
      ),

    body("medicines.*.dosage")
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage(
        "Dosage cannot exceed 200 characters"
      ),

    body("medicines.*.duration")
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage(
        "Duration cannot exceed 200 characters"
      ),

    // Vaccination
    body("vaccinationGiven")
      .optional()
      .isBoolean()
      .withMessage(
        "vaccinationGiven must be true or false"
      ),

    body("vaccinationName")
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage(
        "Vaccination name cannot exceed 200 characters"
      ),

    // Next visit
    body("nextVisitDate")
      .optional({ nullable: true })
      .isISO8601()
      .withMessage(
        "Invalid next visit date"
      ),

    // Notes
    body("notes")
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage(
        "Notes cannot exceed 2000 characters"
      ),

    // Attachments
    body("attachments")
      .optional()
      .isArray()
      .withMessage(
        "Attachments must be an array"
      ),

    body("attachments.*")
      .optional()
      .isURL()
      .withMessage(
        "Each attachment must be a valid URL"
      ),
  ],
  validate,
  addHealthLog
);


// ======================================================
// UPDATE HEALTH RECORD
// ======================================================

router.put(
  "/:id",
  protect,
  authorize("VETERINARIAN", "ADMIN"),
  [
    // Health record ID
    param("id")
      .isMongoId()
      .withMessage(
        "Invalid health record ID"
      ),

    // Visit date
    body("visitDate")
      .optional()
      .isISO8601()
      .withMessage(
        "Invalid visit date"
      ),

    // Diagnosis
    body("diagnosis")
      .optional()
      .trim()
      .isLength({
        min: 1,
        max: 2000,
      })
      .withMessage(
        "Diagnosis must be between 1 and 2000 characters"
      ),

    // Symptoms
    body("symptoms")
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage(
        "Symptoms cannot exceed 2000 characters"
      ),

    // Treatment
    body("treatment")
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage(
        "Treatment cannot exceed 2000 characters"
      ),

    // Medicines
    body("medicines")
      .optional()
      .isArray()
      .withMessage(
        "Medicines must be an array"
      ),

    body("medicines.*.name")
      .if(body("medicines").exists())
      .notEmpty()
      .withMessage(
        "Medicine name is required"
      )
      .trim()
      .isLength({ max: 200 })
      .withMessage(
        "Medicine name cannot exceed 200 characters"
      ),

    body("medicines.*.dosage")
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage(
        "Dosage cannot exceed 200 characters"
      ),

    body("medicines.*.duration")
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage(
        "Duration cannot exceed 200 characters"
      ),

    // Vaccination
    body("vaccinationGiven")
      .optional()
      .isBoolean()
      .withMessage(
        "vaccinationGiven must be true or false"
      ),

    body("vaccinationName")
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage(
        "Vaccination name cannot exceed 200 characters"
      ),

    // Next visit
    body("nextVisitDate")
      .optional({ nullable: true })
      .isISO8601()
      .withMessage(
        "Invalid next visit date"
      ),

    // Notes
    body("notes")
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage(
        "Notes cannot exceed 2000 characters"
      ),

    // Attachments
    body("attachments")
      .optional()
      .isArray()
      .withMessage(
        "Attachments must be an array"
      ),

    body("attachments.*")
      .optional()
      .isURL()
      .withMessage(
        "Each attachment must be a valid URL"
      ),
  ],
  validate,
  editHealthLog
);


// ======================================================
// DELETE HEALTH RECORD
// ======================================================

router.delete(
  "/:id",
  protect,
  authorize("VETERINARIAN", "ADMIN"),
  [
    param("id")
      .isMongoId()
      .withMessage(
        "Invalid health record ID"
      ),
  ],
  validate,
  deleteHealthLog
);

export default router;