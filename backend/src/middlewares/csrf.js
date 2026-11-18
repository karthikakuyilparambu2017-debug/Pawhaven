
import { doubleCsrf } from "csrf-csrf";

const isProduction = process.env.NODE_ENV === "production";

const {
  doubleCsrfProtection,
  generateCsrfToken,
  invalidCsrfTokenError,
} = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET,

  getSessionIdentifier: () => "pawhaven-local-session",

  cookieName: "pawhaven_csrf",

  cookieOptions: {
    httpOnly: false,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    path: "/",
  },

  getCsrfTokenFromRequest: (req) => {
    return req.headers["x-csrf-token"];
  },

  ignoredMethods: ["GET", "HEAD", "OPTIONS"],
});

export {
  doubleCsrfProtection,
  generateCsrfToken,
  invalidCsrfTokenError,
};
