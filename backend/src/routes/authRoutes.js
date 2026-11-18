import express from "express";
import { body,param } from "express-validator";
import passport from "passport";
import upload from "../middlewares/upload.js";
import {register,login,logout,me, refreshAccessToken,forgotPassword,resetPassword,getCsrfToken,googleCallback,updateProfile,changePassword} from "../controllers/authController.js";
import { validate } from "../middlewares/validate.js";
import { protect } from "../middlewares/auth.js";
import { generateCsrfToken } from "../middlewares/csrf.js";

const router = express.Router();

router.get("/csrf-token", getCsrfToken);

// Register
router.post(
  "/register",
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters"),

    body("email")
      .trim()
      .isEmail()
      .withMessage("Please provide a valid email")
      .normalizeEmail(),

    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  validate,
  register
);

// Login
router.post(
  "/login",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Please provide a valid email")
      .normalizeEmail(),

    body("password")
      .notEmpty()
      .withMessage("Password is required"),
  ],
  validate,
  login
);

// Step 1: remember whether the user clicked "Sign up" or "Log in", then go to Google
router.get("/google", (req, res, next) => {
  const mode = req.query.mode === "register" ? "register" : "login";

  res.cookie("pawhaven_google_mode", mode, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 5 * 60 * 1000,
  });

  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    prompt: "select_account",
  })(req, res, next);
});

// Step 2: Google sends the user back here
router.get(
  "/google/callback",
  (req, res, next) => {
    const client = process.env.CLIENT_URL || "http://localhost:5173";

    passport.authenticate("google", { session: false }, (err, user, info) => {
      const mode = req.cookies?.pawhaven_google_mode;
      res.clearCookie("pawhaven_google_mode");

      if (err) {
        console.error("Google sign-in error:", err.message);
        return res.redirect(`${client}/login?error=google`);
      }

      if (!user) {
        console.error("Google sign-in refused:", info?.reason || "no user returned");
        return res.redirect(`${client}/login?error=google`);
      }

      // Clicked "Sign up with Google" but the email already has an account
      if (mode === "register" && info?.isNew === false) {
        return res.redirect(`${client}/login?error=exists`);
      }

      req.user = user;
      next();
    })(req, res, next);
  },
  googleCallback
);

// REFRESH ACCESS TOKEN   
router.post(                        //Do not put protect on this route.                                            
  "/refresh",                       //Because when the access token expires, protect would reject the request.
  refreshAccessToken
);

// Logout
router.post(
  "/logout",
  protect,
  logout
);

// Get logged-in user
router.get(
  "/me",
  protect,
  me
);

export default router;

// Update my name and photo (multer must come first so the form fields are read)
router.patch(
  "/profile",
  protect,
  upload.single("image"),
  [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Name must be between 2 and 100 characters"),
  ],
  validate,
  updateProfile
);

// Change my password
router.patch(
  "/change-password",
  protect,
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters"),
  ],
  validate,
  changePassword
);

// FORGOT PASSWORD
router.post(
  "/forgot-password",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage(
        "Please provide a valid email"
      )
      .normalizeEmail(),
  ],
  validate,
  forgotPassword
);

// RESET PASSWORD
router.post(
  "/reset-password/:token",
  [
    param("token")
      .notEmpty()
      .withMessage(
        "Reset token is required"
      ),

    body("password")
      .isLength({ min: 6 })
      .withMessage(
        "Password must be at least 6 characters"
      ),
  ],
  validate,
  resetPassword
);

router.get("/csrf-token", (req, res) => {
  const token = generateCsrfToken(req, res);

  res.status(200).json({
    success: true,
    csrfToken: token,
  });
});