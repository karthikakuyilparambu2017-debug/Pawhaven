import User from "../models/User.js";
import AppError from "../utils/appError.js";
import {hashPassword,comparePassword,} from "../utils/password.js";
import { sendWelcomeEmail } from "../services/emailService.js";
import {signAccessToken,signRefreshToken,verifyRefreshToken,} from "../utils/jwt.js";
import crypto from "crypto";  
import transporter from "../config/mailer.js";
import { generateCsrfToken } from "../middlewares/csrf.js";
import { uploadImage } from "../services/uploadService.js";

function accessCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 15 * 60 * 1000,
  };
}

function refreshCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return next(new AppError("Email already registered", 409));
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "PET_OWNER",
    });

    // Send welcome email
   sendWelcomeEmail(user).catch((err) =>
      console.error("Welcome email failed:", err.message)
    );

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    res.cookie(
      process.env.COOKIE_NAME || "pawhaven_access_token",
      accessToken,
      accessCookieOptions()
    );

    res.cookie(
      process.env.REFRESH_COOKIE_NAME || "pawhaven_refresh_token",
      refreshToken,
      refreshCookieOptions()
    );

    res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
}
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return next(new AppError("Invalid email or password", 401));
    }

    const passwordMatched = await comparePassword(
      password,
      user.password
    );

    if (!passwordMatched) {
      return next(new AppError("Invalid email or password", 401));
    }

    if (!user.isActive) {
      return next(new AppError("Your account is inactive", 403));
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    res.cookie(
      process.env.COOKIE_NAME || "pawhaven_access_token",
      accessToken,
      accessCookieOptions()
    );

    res.cookie(
      process.env.REFRESH_COOKIE_NAME || "pawhaven_refresh_token",
      refreshToken,
      refreshCookieOptions()
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// REFRESH ACCESS TOKEN
// POST /api/auth/refresh
// ==========================================

export async function refreshAccessToken(
  req,
  res,
  next
) {
  try {
    const refreshCookieName =
      process.env.REFRESH_COOKIE_NAME ||
      "pawhaven_refresh_token";

    const refreshToken =
      req.cookies[refreshCookieName];

    if (!refreshToken) {
      return next(
        new AppError(
          "Refresh token is required",
          401
        )
      );
    }

    // Verify refresh token
    const decoded =
      verifyRefreshToken(refreshToken);

    // Find user from token
    const user = await User.findById(
      decoded.sub
    ).select("-password");

    if (!user) {
      return next(
        new AppError(
          "User no longer exists",
          401
        )
      );
    }

    if (!user.isActive) {
      return next(
        new AppError(
          "Your account is inactive",
          403
        )
      );
    }

    // Create new access token
    const accessToken =
      signAccessToken(user);

    // Send new access token cookie
    res.cookie(
      process.env.COOKIE_NAME ||
        "pawhaven_access_token",
      accessToken,
      {
        httpOnly: true,
        sameSite: "lax",
        secure:
          process.env.NODE_ENV ===
          "production",
        maxAge:
          15 * 60 * 1000,
      }
    );

    res.status(200).json({
      success: true,
      message:
        "Access token refreshed successfully",
    });
  } catch (error) {
    next(
      new AppError(
        "Invalid or expired refresh token",
        401
      )
    );
  }
}

export function logout(req, res) {
  res.clearCookie(
    process.env.COOKIE_NAME || "pawhaven_access_token"
  );

  res.clearCookie(
    process.env.REFRESH_COOKIE_NAME || "pawhaven_refresh_token"
  );

  res.json({
    success: true,
    message: "Logout successful",
  });
}

export async function me(req, res, next) {
  try {
    const user = await User.findById(req.user._id).select(
      "-password -resetPasswordToken -resetPasswordExpires"
    );

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
}

// FORGOT PASSWORD
export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    // Do not reveal whether an email exists
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    }
     // Generate secure random token
    const resetToken = crypto
      .randomBytes(32)
      .toString("hex");

    // Store token in database
    user.resetPasswordToken = resetToken;

    // Token valid for 15 minutes
    user.resetPasswordExpires =
      Date.now() + 15 * 60 * 1000;

    await user.save();

    // Create frontend reset URL
    const resetUrl =
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
     
     const mailOptions = {
      from: process.env.MAIL_FROM,
      to: user.email,
      subject: "PawHaven Password Reset",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          
          <h2>PawHaven Password Reset 🐾</h2>

          <p>Hello ${user.name},</p>

          <p>
            We received a request to reset your PawHaven password.
          </p>

          <p>
            Click the button below to create a new password:
          </p>

          <p>
            <a
              href="${resetUrl}"
              style="
                 display:inline-block;
                padding:12px 20px;
                background:#071B2B;
                color:white;
                text-decoration:none;
                border-radius:6px;
              "
            >
              Reset Password
            </a>
          </p>

          <p>
            This link will expire in <strong>15 minutes</strong>.
          </p>

          <p>
            If you did not request a password reset,
            you can safely ignore this email.
          </p>

          <br />
          
           <p>
            Regards,<br />
            <strong>PawHaven Team</strong>
          </p>

        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message:
        "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (error) {
    next(error);
  }
}

//  RESET PASSWORD
export async function resetPassword(req, res, next) {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return next(
        new AppError(
          "Invalid or expired password reset token",
          400
        )
      );
    }
     const hashedPassword =
      await hashPassword(password);

    user.password = hashedPassword;

    // Remove reset token
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Password reset successful. You can now login with your new password.",
    });
  } catch (error) {
    next(error);
  }
}

export function getCsrfToken(req, res) {
  const csrfToken = generateCsrfToken(req, res, {
    overwrite: true,
  });

  res.status(200).json({
    success: true,
    csrfToken,
  });
}

// AFTER GOOGLE SIGN-IN: Passport has put the user in req.user
export async function googleCallback(req, res, next) {
  try {
    const user = req.user;

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    res.cookie(
      process.env.COOKIE_NAME || "pawhaven_access_token",
      accessToken,
      accessCookieOptions()
    );

    res.cookie(
      process.env.REFRESH_COOKIE_NAME || "pawhaven_refresh_token",
      refreshToken,
      refreshCookieOptions()
    );

    res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/auth/google/success`);
  } catch (error) {
    next(error);
  }
}

// What we send back about a user (never the password)
const publicUser = (u) => ({
  _id: u._id,
  id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  profileImage: u.profileImage || "",
  isActive: u.isActive,
});

// ==========================================
// UPDATE MY PROFILE (name and photo)
// PATCH /api/auth/profile
// ==========================================
export async function updateProfile(req, res, next) {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const { name, removeImage } = req.body;

    if (name !== undefined && name.trim()) {
      user.name = name.trim();
    }

    if (req.file) {
      user.profileImage = await uploadImage(req.file, "pawhaven/users");
    } else if (removeImage === "true") {
      user.profileImage = "";
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// CHANGE MY PASSWORD
// PATCH /api/auth/change-password
// ==========================================
export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const matched = await comparePassword(currentPassword, user.password);

    // 400, not 401, so the browser does not try to "refresh" the login
    if (!matched) {
      return next(new AppError("Current password is incorrect", 400));
    }

    if (currentPassword === newPassword) {
      return next(
        new AppError("New password must be different from the current password", 400)
      );
    }

    user.password = await hashPassword(newPassword);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
}