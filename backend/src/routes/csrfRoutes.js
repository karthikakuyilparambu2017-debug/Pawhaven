import express from "express";
import { generateCsrfToken } from "../middlewares/csrf.js";

const router = express.Router();

router.get("/token", (req, res) => {
  const csrfToken = generateCsrfToken(req, res);

  res.status(200).json({
    success: true,
    csrfToken,
  });
});

export default router;