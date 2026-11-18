import logger from "../utils/logger.js";

export function errorMiddleware(err, req, res, next) {
  logger.error({
    message: err.message,
    method: req.method,
    url: req.originalUrl,
    statusCode: err.statusCode || 500,
    stack: err.stack,
  });

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "Internal server error"
        : err.message,
  });
}