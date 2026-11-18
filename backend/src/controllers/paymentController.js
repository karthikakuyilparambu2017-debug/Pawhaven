import razorpay from "../config/razorpay.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import AppError from "../utils/appError.js";
import crypto from "crypto";

export async function createRazorpayOrder(req, res, next) {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return next(new AppError("Booking ID is required", 400));
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return next(new AppError("Booking not found", 404));
    }

    if (booking.owner.toString() !== req.user._id.toString()) {
      return next(
        new AppError("You are not allowed to pay for this booking", 403)
      );
    }

    // CHANGED: confirmed bookings can be paid too
    if (!["PENDING", "CONFIRMED"].includes(booking.bookingStatus)) {
      return next(
        new AppError(
          "Payment is allowed only for pending or confirmed bookings",
          400
        )
      );
    }

    if (booking.paymentStatus === "PAID") {
      return next(new AppError("This booking is already paid", 400));
    }

    const amountInPaise = Math.round(booking.totalAmount * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `booking_${booking._id}`,
    });

    const payment = await Payment.create({
      booking: booking._id,
      user: booking.owner,
      razorpayOrderId: razorpayOrder.id,
      amount: booking.totalAmount,
      currency: "INR",
      status: "PENDING",
    });

    booking.paymentMethod = "RAZORPAY";
    await booking.save();

    res.status(201).json({
      success: true,
      message: "Razorpay order created successfully",

      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        paymentId: payment._id,
        bookingId: booking._id,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyRazorpayPayment(req, res, next) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return next(
        new AppError("Payment verification details are required", 400)
      );
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return next(new AppError("Invalid payment signature", 400));
    }

    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!payment) {
      return next(new AppError("Payment record not found", 404));
    }

    if (payment.user.toString() !== req.user._id.toString()) {
      return next(
        new AppError("You are not allowed to verify this payment", 403)
      );
    }

    const booking = await Booking.findById(payment.booking);

    if (!booking) {
      return next(new AppError("Booking not found", 404));
    }

    // CHANGED: if this payment was already verified, just return success
    // (stops a repeated request from changing the booking again)
    if (payment.status === "PAID") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        data: {
          paymentId: payment._id,
          bookingId: booking._id,
          paymentStatus: payment.status,
          bookingStatus: booking.bookingStatus,
        },
      });
    }

    payment.razorpayPaymentId = razorpay_payment_id;
    payment.status = "PAID";
    payment.paymentMethod = "RAZORPAY";
    payment.paidAt = new Date();

    await payment.save();

    booking.paymentStatus = "PAID";
    booking.paymentMethod = "RAZORPAY";
    booking.paymentId = razorpay_payment_id;

    // CHANGED: only a pending booking becomes confirmed.
    // A booking that is already checked in or completed keeps its status.
    if (booking.bookingStatus === "PENDING") {
      booking.bookingStatus = "CONFIRMED";
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: {
        paymentId: payment._id,
        bookingId: booking._id,
        paymentStatus: payment.status,
        bookingStatus: booking.bookingStatus,
      },
    });
  } catch (error) {
    next(error);
  }
}