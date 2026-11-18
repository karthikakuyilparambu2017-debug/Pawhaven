import HealthLog from "../models/HealthLog.js";
import Pet from "../models/Pet.js";
import Booking from "../models/Booking.js";
import AppError from "../utils/appError.js";

// ======================================================
// CREATE HEALTH RECORD
// ======================================================

export async function createHealthRecord(data, user) {
  const {
    pet,
    booking,
    visitDate,
    diagnosis,
    symptoms,
    treatment,
    medicines,
    vaccinationGiven,
    vaccinationName,
    nextVisitDate,
    notes,
    attachments,
  } = data;

  // 1. Check user role
  if (!["VETERINARIAN", "ADMIN"].includes(user.role)) {
    throw new AppError(
      "Only veterinarian or admin can create health records",
      403
    );
  }

  // 2. Check pet exists
  const petData = await Pet.findById(pet);

  if (!petData) {
    throw new AppError("Pet not found", 404);
  }

  // 3. Check booking if provided
  let bookingData = null;

  if (booking) {
    bookingData = await Booking.findById(booking);

    if (!bookingData) {
      throw new AppError("Booking not found", 404);
    }

    // 4. Check booking belongs to this pet
    if (bookingData.pet.toString() !== pet.toString()) {
      throw new AppError(
        "This booking does not belong to the selected pet",
        400
      );
    }

    // 5. Check booking status
    if (
      !["CONFIRMED", "CHECKED_IN", "COMPLETED"].includes(
        bookingData.bookingStatus
      )
    ) {
      throw new AppError(
        `Health records cannot be created for a booking with status ${bookingData.bookingStatus}`,
        400
      );
    }
  }

  // 6. Validate visit date
  const visitDateValue = visitDate
    ? new Date(visitDate)
    : new Date();

  if (Number.isNaN(visitDateValue.getTime())) {
    throw new AppError("Invalid visit date", 400);
  }

  // 7. If booking exists,
  //    visit date must be inside booking period
  if (bookingData) {
    if (
      visitDateValue < bookingData.checkInDate ||
      visitDateValue >= bookingData.checkOutDate
    ) {
      throw new AppError(
        "Visit date must be within the booking period",
        400
      );
    }
  }

  // 8. Vaccination validation
  if (
    vaccinationGiven === true &&
    !vaccinationName?.trim()
  ) {
    throw new AppError(
      "Vaccination name is required when vaccination is given",
      400
    );
  }

  // 9. Create health record
  const healthLog = await HealthLog.create({
    pet,
    booking: booking || null,
    veterinarian: user._id,
    visitDate: visitDateValue,
    diagnosis,
    symptoms: symptoms || "",
    treatment: treatment || "",
    medicines: medicines || [],
    vaccinationGiven: vaccinationGiven || false,
    vaccinationName: vaccinationName || "",
    nextVisitDate: nextVisitDate || null,
    notes: notes || "",
    attachments: attachments || [],
  });

  // 10. Return populated health record
  const populatedHealthLog = await HealthLog.findById(
    healthLog._id
  )
    .populate(
      "pet",
      "name species breed image"
    )
    .populate(
      "booking",
      "checkInDate checkOutDate bookingStatus"
    )
    .populate(
      "veterinarian",
      "name email role"
    );

  return populatedHealthLog;
}


// ======================================================
// GET ALL HEALTH RECORDS FOR A PET
// ======================================================

export async function listPetHealthRecords(
  petId,
  user
) {
  // 1. Check pet exists
  const pet = await Pet.findById(petId);

  if (!pet) {
    throw new AppError("Pet not found", 404);
  }

  // 2. Check authorization
  const isOwner =
    pet.owner.toString() === user._id.toString();

  const isVeterinarianOrAdmin =
    ["VETERINARIAN", "ADMIN"].includes(user.role);

  if (!isOwner && !isVeterinarianOrAdmin) {
    throw new AppError(
      "You are not authorized to view these health records",
      403
    );
  }

  // 3. Get health records
  const healthLogs = await HealthLog.find({
    pet: petId,
  })
    .populate(
      "veterinarian",
      "name email role"
    )
    .populate(
      "booking",
      "checkInDate checkOutDate bookingStatus"
    )
    .sort({
      visitDate: -1,
    });

  return healthLogs;
}


// ======================================================
// GET ONE HEALTH RECORD
// ======================================================

export async function getHealthRecordById(
  healthLogId,
  user
) {
  const healthLog = await HealthLog.findById(
    healthLogId
  )
    .populate("pet")
    .populate("booking")
    .populate(
      "veterinarian",
      "name email role"
    );

  if (!healthLog) {
    throw new AppError(
      "Health record not found",
      404
    );
  }

  // Check owner
  const isOwner =
    healthLog.pet.owner.toString() ===
    user._id.toString();

  // Check veterinarian/admin
  const isVeterinarianOrAdmin =
    ["VETERINARIAN", "ADMIN"].includes(user.role);

  if (!isOwner && !isVeterinarianOrAdmin) {
    throw new AppError(
      "You are not authorized to view this health record",
      403
    );
  }

  return healthLog;
}


// ======================================================
// UPDATE HEALTH RECORD
// ======================================================

export async function updateHealthRecord(
  healthLogId,
  data,
  user
) {
  // 1. Find health record
  const healthLog = await HealthLog.findById(
    healthLogId
  );

  if (!healthLog) {
    throw new AppError(
      "Health record not found",
      404
    );
  }

  // 2. Check role
  if (
    !["VETERINARIAN", "ADMIN"].includes(
      user.role
    )
  ) {
    throw new AppError(
      "Only veterinarian or admin can update health records",
      403
    );
  }

  // 3. Allowed fields
  const allowedFields = [
    "visitDate",
    "diagnosis",
    "symptoms",
    "treatment",
    "medicines",
    "vaccinationGiven",
    "vaccinationName",
    "nextVisitDate",
    "notes",
    "attachments",
  ];

  // 4. Update only allowed fields
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      healthLog[field] = data[field];
    }
  }

  // 5. Vaccination validation
  if (
    healthLog.vaccinationGiven === true &&
    !healthLog.vaccinationName?.trim()
  ) {
    throw new AppError(
      "Vaccination name is required when vaccination is given",
      400
    );
  }

  // 6. Save
  await healthLog.save();

  // 7. Return populated record
  const updatedHealthLog =
    await HealthLog.findById(
      healthLog._id
    )
      .populate(
        "pet",
        "name species breed image"
      )
      .populate(
        "booking",
        "checkInDate checkOutDate bookingStatus"
      )
      .populate(
        "veterinarian",
        "name email role"
      );

  return updatedHealthLog;
}


// ======================================================
// DELETE HEALTH RECORD
// ======================================================

export async function deleteHealthRecord(
  healthLogId,
  user
) {
  // 1. Find health record
  const healthLog = await HealthLog.findById(
    healthLogId
  );

  if (!healthLog) {
    throw new AppError(
      "Health record not found",
      404
    );
  }

  // 2. Check role
  if (
    !["VETERINARIAN", "ADMIN"].includes(
      user.role
    )
  ) {
    throw new AppError(
      "Only veterinarian or admin can delete health records",
      403
    );
  }

  // 3. Delete
  await HealthLog.findByIdAndDelete(
    healthLogId
  );

  return healthLog;
}