// import passport from "passport";
// import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// import crypto from "crypto";

// import User from "../models/User.js";
// import { hashPassword } from "../utils/password.js";
// import { sendWelcomeEmail } from "../services/emailService.js";

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL:
//         process.env.GOOGLE_CALLBACK_URL ||
//         "http://localhost:5000/api/auth/google/callback",
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         const googleEmail = profile.emails?.[0];
//         const verified = [googleEmail?.verified, profile._json?.email_verified].some(
//           (v) => v === true || v === "true"
//         );

//         if (!googleEmail?.value || !verified) {
//           return done(null, false);
//         }

//         const email = googleEmail.value.toLowerCase().trim();
//         let user = await User.findOne({ email });

//         // A deactivated account cannot sign in
//         if (user && user.isActive === false) {
//           return done(null, false);
//         }

//         if (!user) {
//           // New visitor: always a pet owner, with a random password nobody knows
//           const unusablePassword = await hashPassword(
//             crypto.randomBytes(32).toString("hex")
//           );

//           user = await User.create({
//             name: (profile.displayName || email.split("@")[0]).trim(),
//             email,
//             password: unusablePassword,
//             role: "PET_OWNER",
//           });

//           // Sent in the background, so a mail problem never blocks sign-in
//           sendWelcomeEmail(user).catch((err) =>
//             console.error("Welcome email failed:", err.message)
//           );
//         }

//         return done(null, user);
//       } catch (error) {
//         return done(error);
//       }
//     }
//   )
// );

// export default passport;


import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import crypto from "crypto";

import User from "../models/User.js";
import { hashPassword } from "../utils/password.js";
import { sendWelcomeEmail } from "../services/emailService.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "http://localhost:5000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleEmail = profile.emails?.[0];
        const verified = [googleEmail?.verified, profile._json?.email_verified].some(
          (v) => v === true || v === "true"
        );

        if (!googleEmail?.value || !verified) {
          return done(null, false, { reason: "Google email is not verified" });
        }

        const email = googleEmail.value.toLowerCase().trim();
        let user = await User.findOne({ email });

        if (user && user.isActive === false) {
          return done(null, false, { reason: "This account is deactivated" });
        }

        let isNew = false;

        if (!user) {
          // New visitor: always a pet owner, with a random password nobody knows
          const unusablePassword = await hashPassword(
            crypto.randomBytes(32).toString("hex")
          );

          user = await User.create({
            name: (profile.displayName || email.split("@")[0]).trim(),
            email,
            password: unusablePassword,
            role: "PET_OWNER",
          });
          isNew = true;

          sendWelcomeEmail(user).catch((err) =>
            console.error("Welcome email failed:", err.message)
          );
        }

        return done(null, user, { isNew });
      } catch (error) {
        return done(error);
      }
    }
  )
);

export default passport;
