import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";


import authRoutes from "./routes/authRoutes.js";
import petRoutes from "./routes/petRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import careLogRoutes from "./routes/careLogRoutes.js";
import healthLogRoutes from "./routes/healthLogRoutes.js";
import suiteRoutes from "./routes/suiteRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import csrfRoutes from "./routes/csrfRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import passport from "./config/passport.js";

import { notFound } from "./middlewares/notFound.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import { doubleCsrfProtection } from "./middlewares/csrf.js";

const app = express();

// Trust proxy for secure cookies when deployed behind a proxy
app.set("trust proxy", 1);


// CORS

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);


// Security & Logging

app.use(helmet());

app.use(morgan("dev"));


// Body Parsers

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);


// Cookie Parser

app.use(cookieParser());
app.use(doubleCsrfProtection);

// -----------------------------
// Root Route
// -----------------------------
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "PawHaven API is running",
  });
});


// Health Check

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "PawHaven backend is working",
  });
});


//ROUTES

app.use("/api/auth", authRoutes);
app.use("/api/csrf", csrfRoutes);
app.use("/api/users", userRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/care-logs", careLogRoutes);
app.use("/api/health-logs", healthLogRoutes);
app.use("/api/suites", suiteRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);
app.use(passport.initialize());

app.use(notFound);

app.use(errorMiddleware);


// Server

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`PawHaven server running http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed", error.message);
    process.exit(1);
  }
}
if(process.env.NODE_ENV !== "test") {
  startServer();
}
export default app;