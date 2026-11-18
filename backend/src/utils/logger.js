import winston from "winston";

const logger = winston.createLogger({
  level: "info",

  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),

  transports: [
    // Show logs in terminal
    new winston.transports.Console(),

    // Only error logs
    new winston.transports.File({
      filename: "src/logs/Error.log",
      level: "error",
    }),

    // All logs
    new winston.transports.File({
      filename: "src/logs/Combined.log",
    }),
  ],
});

export default logger;