import express from "express";
import {body,param} from "express-validator";
import {getMyPets,getOnePet,createPet,updatePet,deletePet} from "../controllers/petController.js";

import {protect,authorize } from "../middlewares/auth.js";
import {validate} from "../middlewares/validate.js";
import upload from "../middlewares/upload.js";

const router=express.Router();
//GET MY PETS
 router.get("/",protect,
    authorize("PET_OWNER"),
    getMyPets);

 //GET ONE PET
 router.get("/:id",protect,
    [param("id").isMongoId().withMessage("Invalid pet ID"),],validate,getOnePet);

 //CREATE PET
router.post("/",protect,
    authorize("PET_OWNER","ADMIN"),
    upload.single("image"),[body("name").trim().notEmpty().withMessage("pet name is required").isLength({min:2,max:50}).withMessage("pet name must be between 2 and 50 characters"),body("species").trim().notEmpty().withMessage("Species is required"), body("breed").optional().trim(),
    body("age").optional().isFloat({min:0}).withMessage("Age must be a valid positive number"), body("gender").optional().trim(), body("weight")
    .optional().isFloat({min:0}).withMessage("Weight must be a valid positive number"),
    
    body("medicalNotes").optional()
    .trim().isLength({max:1000}).withMessage("Medical notes cannot exceed 1000 characters"),
    body("vaccinationStatus").optional().trim(),
],validate,createPet);

//UPDATE PET

router.put(
  "/:id",
  protect,
  authorize("PET_OWNER", "ADMIN"),
  upload.single("image"),
  [
    param("id")
      .isMongoId()
      .withMessage("Invalid pet ID"),

    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Pet name must be between 2 and 50 characters"),

    body("species")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Species cannot be empty"),

    body("breed")
      .optional()
      .trim(),

    body("age")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Age must be a valid positive number"),

    body("gender")
      .optional()
      .trim(),

    body("weight")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Weight must be a valid positive number"),

    body("medicalNotes")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Medical notes cannot exceed 1000 characters"),

    body("vaccinationStatus")
      .optional()
      .trim(),
  ],
  validate,
  updatePet
);

//DELETE PET
router.delete("/:id",protect,authorize("PET_OWNER","ADMIN"),
[
    param("id").isMongoId().withMessage("Invalid pet id")
],validate,deletePet);

export default router;