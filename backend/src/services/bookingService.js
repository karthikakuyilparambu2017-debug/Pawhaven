import Booking from "../models/Booking.js";
import Pet from "../models/Pet.js";
import Suite from "../models/Suite.js";
import AppError from "../utils/appError.js";


// ==================================================
// CREATE BOOKING
// ==================================================

export async function createNewBooking(data, user) {

  const {
    pet,
    suite,
    checkInDate,
    checkOutDate,
    specialInstructions,
  } = data;


  // ----------------------------------------------
  // Check pet
  // ----------------------------------------------

  const petData = await Pet.findOne({
    _id: pet,
    owner: user._id,
    isActive: true,
  });

  if (!petData) {
    throw new AppError(
      "Pet not found or you are not the owner",
      404
    );
  }


  // ----------------------------------------------
  // Check suite
  // ----------------------------------------------

  const suiteData = await Suite.findOne({
    _id: suite,
    isAvailable: true,
  });

  if (!suiteData) {
    throw new AppError(
      "Suite not found or currently unavailable",
      404
    );
  }


  // ----------------------------------------------
  // Convert dates
  // ----------------------------------------------

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);


  // ----------------------------------------------
  // Validate dates
  // ----------------------------------------------

  if (
    Number.isNaN(checkIn.getTime()) ||
    Number.isNaN(checkOut.getTime())
  ) {
    throw new AppError(
      "Invalid booking dates",
      400
    );
  }


  if (checkOut <= checkIn) {
    throw new AppError(
      "Check-out date must be after check-in date",
      400
    );
  }


  // ----------------------------------------------
  // Calculate number of days
  // ----------------------------------------------

  const millisecondsPerDay =
    1000 * 60 * 60 * 24;

  const numberOfDays = Math.ceil(
    (checkOut - checkIn) /
      millisecondsPerDay
  );


  if (numberOfDays < 1) {
    throw new AppError(
      "Booking must be at least 1 day",
      400
    );
  }


  // ----------------------------------------------
  // Check booking conflict
  // ----------------------------------------------

  const conflictingBooking =
    await Booking.findOne({

      suite,

      bookingStatus: {
        $in: [
          "PENDING",
          "CONFIRMED",
          "CHECKED_IN",
        ],
      },

      checkInDate: {
        $lt: checkOut,
      },

      checkOutDate: {
        $gt: checkIn,
      },
    });


  if (conflictingBooking) {
    throw new AppError(
      "This suite is already booked for the selected dates",
      409
    );
  }


  // ----------------------------------------------
  // Calculate total amount
  // ----------------------------------------------

  const totalAmount =
    numberOfDays *
    suiteData.pricePerDay;


  // ----------------------------------------------
  // Create booking
  // ----------------------------------------------

  const booking =
    await Booking.create({

      owner: user._id,

      pet: petData._id,

      suite: suiteData._id,

      checkInDate: checkIn,

      checkOutDate: checkOut,

      numberOfDays,

      totalAmount,

      bookingStatus: "PENDING",

      paymentStatus: "PENDING",

      paymentMethod: "NONE",

      specialInstructions:
        specialInstructions || "",
    });


  // ----------------------------------------------
  // Return populated booking
  // ----------------------------------------------

  return Booking.findById(
    booking._id
  )
    .populate(
      "owner",
      "name email"
    )
    .populate(
      "pet",
      "name species breed image"
    )
    .populate(
      "suite",
      "name type pricePerDay amenities"
    );
}


// ==================================================
// GET MY BOOKINGS
// ==================================================

export async function listMyBookings(userId) {

  return Booking.find({
    owner: userId,
  })
    .populate(
      "pet",
      "name species breed image"
    )
    .populate(
      "suite",
      "name type pricePerDay"
    )
    .sort({
      createdAt: -1,
    });
}


// ==================================================
// GET ONE BOOKING
// ==================================================

export async function getBookingById(
  bookingId,
  user
) {

  const booking =
    await Booking.findById(
      bookingId
    )
      .populate(
        "owner",
        "name email"
      )
      .populate(
        "pet",
        "name species breed image"
      )
      .populate(
        "suite",
        "name type pricePerDay amenities"
      );


  if (!booking) {
    throw new AppError(
      "Booking not found",
      404
    );
  }


  const isOwner =
    booking.owner._id.toString() ===
    user._id.toString();


  const isStaffOrAdmin = [
    "STAFF",
    "ADMIN",
  ].includes(user.role);


  if (
    !isOwner &&
    !isStaffOrAdmin
  ) {
    throw new AppError(
      "You are not authorized to view this booking",
      403
    );
  }


  return booking;
}


// ==================================================
// CANCEL BOOKING
// ==================================================
export async function cancelMyBooking(
  bookingId,
  user,
  cancellationReason = ""
) {
  const booking = await Booking.findOne({
    _id: bookingId,
    owner: user._id,
  });

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  if (
    ["COMPLETED", "CANCELLED", "CHECKED_IN"].includes(
      booking.bookingStatus
    )
  ) {
    throw new AppError(
      `Booking cannot be cancelled because its status is ${booking.bookingStatus}`,
      400
    );
  }

  booking.bookingStatus = "CANCELLED";
  booking.cancellationReason = cancellationReason;

  await booking.save();

  return booking;
}


// ==================================================
// UPDATE BOOKING STATUS
// ==================================================

export async function updateBookingStatus(
  bookingId,
  status,
  user
) {

  const allowedStatuses = [
    "PENDING",
    "CONFIRMED",
    "CHECKED_IN",
    "COMPLETED",
    "CANCELLED",
    "REJECTED",
  ];


  if (
    !allowedStatuses.includes(status)
  ) {
    throw new AppError(
      "Invalid booking status",
      400
    );
  }


  const booking =
    await Booking.findById(
      bookingId
    );


  if (!booking) {
    throw new AppError(
      "Booking not found",
      404
    );
  }


  const isStaffOrAdmin = [
    "STAFF",
    "ADMIN",
  ].includes(user.role);


  if (!isStaffOrAdmin) {
    throw new AppError(
      "You are not authorized to update booking status",
      403
    );
  }


  booking.bookingStatus =
    status;


  await booking.save();


  return booking;
}

// ==================================================
// GET ALL BOOKINGS (STAFF / ADMIN)
// ==================================================

export async function listAllBookings(status) {
  const filter = status ? { bookingStatus: status } : {};

  return Booking.find(filter)
    .populate("owner", "name email")
    .populate("pet", "name species breed image")
    .populate("suite", "name type pricePerDay")
    .sort({ createdAt: -1 });
}