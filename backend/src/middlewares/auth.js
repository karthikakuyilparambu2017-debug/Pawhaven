import User from "../models/User.js";
import AppError from "../utils/appError.js";
import { verifyAccessToken } from "../utils/jwt.js";

export async function protect(req, res, next) {
  try {
    const cookieName =
      process.env.COOKIE_NAME || "pawhaven_access_token";

    const token = req.cookies[cookieName];

    if (!token) {
      return next(
        new AppError("Authentication required", 401)
      );
    }

    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.sub)
      .select("-password");

    if (!user) {
      return next(
        new AppError("User no longer exists", 401)
      );
    }

    if (!user.isActive) {
      return next(
        new AppError("Your account is inactive", 403)
      );
    }

    req.user = user;

    next();
  } catch (error) {
    next(
      new AppError(
        "Invalid or expired authentication",
        401
      )
    );
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (
      !req.user ||
      !roles.includes(req.user.role)
    ) {
      return next(
        new AppError(
          "You are not authorized",
          403
        )
      );
    }

    next();
  };
}