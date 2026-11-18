import express from "express";
import { body,param } from "express-validator";
import {addCareLog,getCareLogs,getCareLog,editCareLog,deleteCareLog,} from "../controllers/careLogController.js";
import { protect,authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";

const router= express.Router();

// GET CARE LOGS FOR A PET
router.get("/pet/:petId",protect,
    [
        param("petId").isMongoId().withMessage("Invalid pet ID"),
    ],
    validate,
    getCareLogs
);

// GET ONE CARE LOG
router.get("/:id",protect,
    [
        param("id").isMongoId().withMessage("Invalid care log ID"),
    ],
    validate,
    getCareLog
);

// CREATE CARE LOG
router.post("/",protect,authorize("STAFF","ADMIN"),
[
   body("booking")
  .isMongoId()
  .withMessage("Valid booking ID is required"),

    body("pet")
      .isMongoId()
      .withMessage("Valid pet ID is required"),

    body("careDate")
      .isISO8601()
      .withMessage("Valid care date is required"),

    body("feeding")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Feeding details cannot exceed 1000 characters"),

    body("walking")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Walking details cannot exceed 1000 characters"),

    body("grooming")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Grooming details cannot exceed 1000 characters"),

    body("medication")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Medication details cannot exceed 1000 characters"),

    body("activityNotes")
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage(
        "Activity notes cannot exceed 2000 characters"
      ), 
    
     body("mood")
      .optional()
      .isIn([
        "HAPPY",
        "CALM",
        "ACTIVE",
        "ANXIOUS",
        "SICK",
        "UNKNOWN",
      ])
      .withMessage("Invalid mood"),

    body("images")
      .optional()
      .isArray()
      .withMessage("Images must be an array"),

    body("images.*")
      .optional()
      .isURL()
      .withMessage("Each image must be a valid URL"),  
],
validate,
addCareLog
);

// UPDATE CARE LOG
router.put(
  "/:id",
  protect,
  authorize("STAFF", "ADMIN"),

  [
    param("id")
      .isMongoId()
      .withMessage("Invalid care log ID"),

    body("careDate")
      .optional()
      .isISO8601()
      .withMessage("Invalid care date"),

    body("feeding")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Feeding details cannot exceed 1000 characters"),

    body("walking")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Walking details cannot exceed 1000 characters"),

    body("grooming")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Grooming details cannot exceed 1000 characters"),

    body("medication")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Medication details cannot exceed 1000 characters"),
      body("activityNotes")
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage(
        "Activity notes cannot exceed 2000 characters"
      ),

    body("mood")
      .optional()
      .isIn([
        "HAPPY",
        "CALM",
        "ACTIVE",
        "ANXIOUS",
        "SICK",
        "UNKNOWN",
      ])
      .withMessage("Invalid mood"),

     body("images")
      .optional()
      .isArray()
      .withMessage("Images must be an array"),

    body("images.*")
      .optional()
      .isURL()
      .withMessage("Each image must be a valid URL"),
  ],

  validate,
  editCareLog
);  

// DELETE CARE LOG
router.delete("/:id",protect,authorize("STAFF","ADMIN"),
[
    param("id").isMongoId().withMessage("Invalid care log ID"),
],
validate,
deleteCareLog
);

export default router;