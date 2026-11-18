import {
  uploadProfileImage,
  getMyProfile,
} from "../services/userService.js";

export async function uploadMyProfileImage(req, res, next) {
  try {
    const user = await uploadProfileImage(req.user._id, req.file);

    res.status(200).json({
      success: true,
      message: "Profile image uploaded successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyProfileController(req, res, next) {
  try {
    const user = await getMyProfile(req.user._id);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
}