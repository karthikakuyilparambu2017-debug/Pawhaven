import CareLog from "../models/CareLog.js";
import Booking from "../models/Booking.js";
import Pet from "../models/Pet.js";
import AppError from "../utils/appError.js";

export async function createCareLog(data, user) {
  const {
    booking,
    pet,
    careDate,
    feeding,
    walking,
    grooming,
    medication,
    activityNotes,
    mood,
    images,
  } = data;

  // 1. Check user role
  if (!["STAFF", "ADMIN"].includes(user.role)) {
    throw new AppError(
      "Only staff or admin can create care logs",
      403
    );
  }

  // 2. Check booking exists
  const bookingData = await Booking.findById(booking);

  if (!bookingData) {
    throw new AppError("Booking not found", 404);
  }

  // 3. Check pet exists
  const petData = await Pet.findById(pet);

  if (!petData) {
    throw new AppError("Pet not found", 404);
  }

  // 4. Check pet belongs to this booking
  if (bookingData.pet.toString() !== pet.toString()) {
    throw new AppError(
      "This pet does not belong to the selected booking",
      400
    );
  }

  // 5. Check booking status
  if (
    !["CONFIRMED", "CHECKED_IN"].includes(
      bookingData.bookingStatus
    )
  ) {
    throw new AppError(
      `Care logs cannot be created when booking status is ${bookingData.bookingStatus}`,
      400
    );
  }

  // 6. Check care date
  const careDateValue = new Date(careDate);

  if (Number.isNaN(careDateValue.getTime())) {
    throw new AppError("Invalid care date", 400);
  }

  // 7. Care date must be inside booking period
  if (
    careDateValue < bookingData.checkInDate ||
    careDateValue >= bookingData.checkOutDate
  ) {
    throw new AppError(
      "Care date must be within the booking period",
      400
    );
  }

  // 8. Create care log
  const careLog = await CareLog.create({
    booking,
    pet,
    staff: user._id,
    careDate: careDateValue,
    feeding: feeding || "",
    walking: walking || "",
    grooming: grooming || "",
    medication: medication || "",
    activityNotes: activityNotes || "",
    mood: mood || "UNKNOWN",
    images: images || [],
  });

  // 9. Return useful populated information
  const populatedCareLog = await CareLog.findById(careLog._id)
    .populate("pet", "name species breed image")
    .populate(
      "booking",
      "checkInDate checkOutDate bookingStatus"
    )
    .populate("staff", "name email role");

  return populatedCareLog;
}


export async function getPetCareLogs(petId,user) {
     const pet = await Pet.findById(petId);

  if (!pet) {
    throw new AppError("Pet not found", 404);
  }

  const isOwner =
    pet.owner.toString() === user._id.toString();

  const isStaffOrAdmin =
    ["STAFF", "ADMIN"].includes(user.role);

  if (!isOwner && !isStaffOrAdmin) {
    throw new AppError(
      "You are not authorized to view these care logs",
      403
    );
  }
   const careLogs = await CareLog.find({
    pet: petId,
  })
    .populate("staff", "name email role")
    .populate("booking", "checkInDate checkOutDate bookingStatus")
    .sort({ careDate: -1 });

  return careLogs;
}
export async function getOneCareLog(careLogId, user) {
  const careLog = await CareLog.findById(careLogId)
    .populate("pet")
    .populate("booking")
    .populate("staff", "name email role");

  if (!careLog) {
    throw new AppError("Care log not found", 404);
  }

  const isOwner =
    careLog.pet.owner.toString() === user._id.toString();

  const isStaffOrAdmin =
    ["STAFF", "ADMIN"].includes(user.role);

  if (!isOwner && !isStaffOrAdmin) {
    throw new AppError(
      "You are not authorized to view this care log",
      403
    );
  }

  return careLog;
}
export async function updateCareLog(careLogId, data, user) {
  const careLog = await CareLog.findById(careLogId)
    .populate("pet");

  if (!careLog) {
    throw new AppError("Care log not found", 404);
  }

  // Only the staff/admin can update
  if (!["STAFF", "ADMIN"].includes(user.role)) {
    throw new AppError(
      "Only staff or admin can update care logs",
      403
    );
  }

  const allowedFields = [
    "careDate",
    "feeding",
    "walking",
    "grooming",
    "medication",
    "activityNotes",
    "mood",
    "images",
  ];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      careLog[field] = data[field];
    }
  }

  await careLog.save();

  return careLog;
}
export async function removeCareLog(careLogId, user) {
  const careLog = await CareLog.findById(careLogId);

  if (!careLog) {
    throw new AppError("Care log not found", 404);
  }

  // Only staff/admin can delete
  if (!["STAFF", "ADMIN"].includes(user.role)) {
    throw new AppError(
      "Only staff or admin can delete care logs",
      403
    );
  }

  await CareLog.findByIdAndDelete(careLogId);

  return careLog;
}