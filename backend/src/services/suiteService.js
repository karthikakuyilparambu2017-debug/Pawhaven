import Suite from "../models/Suite.js";
import Booking from "../models/Booking.js";
import AppError from "../utils/appError.js";

// ======================================================
// CREATE SUITE
// ======================================================

export async function createNewSuite(data, user) {
  // Only ADMIN can create suites
  if (user.role !== "ADMIN") {
    throw new AppError(
      "Only admin can create suites",
      403
    );
  }

  const {
    name,
    description,
    type,
    capacity,
    pricePerDay,
    amenities,
    image,
    isAvailable,
  } = data;

  // Check duplicate suite name
  const existingSuite = await Suite.findOne({
    name: name.trim(),
  });

  if (existingSuite) {
    throw new AppError(
      "A suite with this name already exists",
      409
    );
  }

  const suite = await Suite.create({
    name: name.trim(),
    description: description || "",
    type,
    capacity,
    pricePerDay,
    amenities: amenities || [],
    image: image || "",
    isAvailable:
      isAvailable !== undefined
        ? isAvailable
        : true,
  });

  return suite;
}


// ======================================================
// GET ALL SUITES
// ======================================================

export async function listAllSuites() {
  const suites = await Suite.find()
    .sort({ createdAt: -1 });

  return suites;
}


// ======================================================
// GET ONE SUITE
// ======================================================

export async function getSuiteById(suiteId) {
  const suite = await Suite.findById(suiteId);

  if (!suite) {
    throw new AppError(
      "Suite not found",
      404
    );
  }

  return suite;
}


// ======================================================
// UPDATE SUITE
// ======================================================

export async function updateExistingSuite(
  suiteId,
  data,
  user
) {
  // Only ADMIN can update suites
  if (user.role !== "ADMIN") {
    throw new AppError(
      "Only admin can update suites",
      403
    );
  }

  const suite = await Suite.findById(
    suiteId
  );

  if (!suite) {
    throw new AppError(
      "Suite not found",
      404
    );
  }

  // Check duplicate name if name is being changed
  if (
    data.name !== undefined &&
    data.name.trim() !== suite.name
  ) {
    const existingSuite =
      await Suite.findOne({
        name: data.name.trim(),
        _id: { $ne: suiteId },
      });

    if (existingSuite) {
      throw new AppError(
        "A suite with this name already exists",
        409
      );
    }
  }

  const allowedFields = [
    "name",
    "description",
    "type",
    "capacity",
    "pricePerDay",
    "amenities",
    "image",
    "isAvailable",
  ];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      suite[field] =
        field === "name"
          ? data[field].trim()
          : data[field];
    }
  }

  await suite.save();

  return suite;
}


// ======================================================
// DELETE SUITE
// ======================================================

export async function removeSuite(
  suiteId,
  user
) {
  // Only ADMIN can delete suites
  if (user.role !== "ADMIN") {
    throw new AppError(
      "Only admin can delete suites",
      403
    );
  }

  const suite = await Suite.findById(
    suiteId
  );

  if (!suite) {
    throw new AppError(
      "Suite not found",
      404
    );
  }

  // Prevent deletion if suite is used in bookings
  const existingBooking =
    await Booking.findOne({
      suite: suiteId,
    });

  if (existingBooking) {
    throw new AppError(
      "This suite cannot be deleted because it is already used in a booking",
      409
    );
  }

  await Suite.findByIdAndDelete(
    suiteId
  );

  return suite;
}