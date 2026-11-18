import User from "../models/User.js";
import AppError from "../utils/appError.js";
import { uploadImage } from "./uploadService.js";

export async function uploadProfileImage(userId, file) {
  if (!file) {
    throw new AppError("Profile image is required", 400);
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const imageUrl = await uploadImage(
    file,
    "pawhaven/profile-images"
  );

  user.profileImage = imageUrl;

  await user.save();

  return await User.findById(userId).select(
    "-password -resetPasswordToken -resetPasswordExpires"
  );
}

export async function getMyProfile(userId) {
  const user = await User.findById(userId).select(
    "-password -resetPasswordToken -resetPasswordExpires"
  );

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
}