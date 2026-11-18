import { doubleCsrf } from "csrf-csrf";

const {
  doubleCsrfProtection,
  generateCsrfToken,
  invalidCsrfTokenError,
} = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET,

  // Fixed identifier for local development/testing
  getSessionIdentifier: () => "pawhaven-local-session",

  cookieName: "pawhaven_csrf",

  cookieOptions: {
    httpOnly: false,
    sameSite: "lax",
    secure: false,
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