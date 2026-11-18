import express from "express";
import { body, param } from "express-validator";

import {
  createBooking,
  getMyBookings,
  getOneBooking,
  cancelBooking,
  changeBookingStatus,
  getAllBookings,
} from "../controllers/bookingController.js";

import { protect, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";

const router = express.Router();

// GET MY BOOKINGS (pet owner)
router.get("/", protect, authorize("PET_OWNER"), getMyBookings);

// GET ALL BOOKINGS (staff, admin, vet)
// This route must stay ABOVE "/:id", otherwise "all" is read as an id.
router.get(
  "/all",
  protect,
  authorize("STAFF", "ADMIN", "VETERINARIAN"),
  getAllBookings
);

// GET ONE BOOKING
router.get(
  "/:id",
  protect,
  [param("id").isMongoId().withMessage("Invalid booking ID")],
  validate,
  getOneBooking
);

// CREATE BOOKING
router.post(
  "/",
  protect,
  authorize("PET_OWNER"),
  [
    body("pet").isMongoId().withMessage("Valid pet ID is required"),
    body("suite").isMongoId().withMessage("Valid suite ID is required"),
    body("checkInDate").isISO8601().withMessage("Valid check-in date is required"),
    body("checkOutDate").isISO8601().withMessage("Valid check-out date is required"),
    body("specialInstructions")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Special instructions cannot exceed 1000 characters"),
    body("checkOutDate").custom((checkOutDate, { req }) => {
      const checkIn = new Date(req.body.checkInDate);
      const checkOut = new Date(checkOutDate);

      if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
        throw new Error("Invalid booking dates");
      }
      if (checkOut <= checkIn) {
        throw new Error("Check-out date must be after check-in date");
      }
      return true;
    }),
  ],
  validate,
  createBooking
);

// CANCEL MY BOOKING
router.patch(
  "/:id/cancel",
  protect,
  authorize("PET_OWNER"),
  [
    param("id").isMongoId().withMessage("Invalid booking ID"),
    body("cancellationReason")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Cancellation reason cannot exceed 500 characters"),
  ],
  validate,
  cancelBooking
);

// CHANGE BOOKING STATUS (staff, admin)
router.patch(
  "/:id/status",
  protect,
  authorize("STAFF", "ADMIN"),
  [
    param("id").isMongoId().withMessage("Invalid booking ID"),
    body("status")
      .isIn(["PENDING", "CONFIRMED", "CHECKED_IN", "COMPLETED", "CANCELLED", "REJECTED"])
      .withMessage("Invalid booking status"),
  ],
  validate,
  changeBookingStatus
);

export default router;