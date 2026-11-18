import express from "express";
import { body } from "express-validator";

import {
  uploadMyProfileImage,
  getMyProfileController,
} from "../controllers/userController.js";

import { protect } from "../middlewares/auth.js";
import upload from "../middlewares/upload.js";
import { validate } from "../middlewares/validate.js";

const router = express.Router();

// Get logged-in user's profile
router.get(
  "/me",
  protect,
  getMyProfileController
);

// Upload profile image
router.post(
  "/profile-image",
  protect,
  upload.single("profileImage"),
  uploadMyProfileImage
);

export default router;