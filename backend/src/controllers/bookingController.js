import {
  createNewBooking,
  listMyBookings,
  getBookingById,
  cancelMyBooking,
  updateBookingStatus,
  listAllBookings,
} from "../services/bookingService.js";


// CREATE BOOKING
export async function createBooking(req, res, next) {
  try {
    const booking = await createNewBooking(
      req.body,
      req.user
    );

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    next(error);
  }
}


// GET MY BOOKINGS
export async function getMyBookings(req, res, next) {
  try {
    const bookings = await listMyBookings(
      req.user._id
    );

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
}


// GET ONE BOOKING
export async function getOneBooking(req, res, next) {
  try {
    const booking = await getBookingById(
      req.params.id,
      req.user
    );

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    next(error);
  }
}


// CANCEL BOOKING
export async function cancelBooking(req, res, next) {
  try {
    const booking = await cancelMyBooking(
      req.params.id,
      req.user,
      req.body.cancellationReason
    );

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    next(error);
  }
}


// CHANGE BOOKING STATUS
export async function changeBookingStatus(req, res, next) {
  try {
    const booking = await updateBookingStatus(
      req.params.id,
      req.body.status,
      req.user
    );

    res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      booking,
    });
  } catch (error) {
    next(error);
  }
}
// GET ALL BOOKINGS (STAFF / ADMIN)
export async function getAllBookings(req, res, next) {
  try {
    const bookings = await listAllBookings(req.query.status);

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
}