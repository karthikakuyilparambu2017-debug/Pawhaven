// import cloudinary from "../config/cloudinary.js";
// import AppError from "../utils/appError.js";

// export async function uploadImage(file, folder) {
//   if (!file) {
//     throw new AppError("Image file is required", 400);
//   }

//   const result = await new Promise((resolve, reject) => {
//     const uploadStream = cloudinary.uploader.upload_stream(
//       {
//         folder,
//         resource_type: "image",
//       },
//       (error, result) => {
//         if (error) {
//           console.error("Cloudinary upload error:", error);
//           reject(error);
//         } else {
//           resolve(result);
//         }
//       }
//     );

//     uploadStream.end(file.buffer);
//   });

//   return result.secure_url;
// }


import cloudinary from "../config/cloudinary.js";
import AppError from "../utils/appError.js";

export async function uploadImage(file, folder) {
  if (!file) {
    throw new AppError("Image file is required", 400);
  }

  console.log("Starting Cloudinary image upload...");
  console.log("File name:", file.originalname);
  console.log("File type:", file.mimetype);
  console.log("File size:", file.size);

  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
  console.error("========== CLOUDINARY UPLOAD ERROR ==========");
  console.error("Message:", error.message);
  console.error("HTTP code:", error.http_code);
  console.error("Name:", error.name);
  console.error("Full error:", JSON.stringify(error, null, 2));
  console.error("Response:", error.response);
  console.error("Response headers:", error.response?.headers);
  console.error("==============================================");

  reject(error);
} else {
            resolve(result);
          }
        }
      );

      uploadStream.end(file.buffer);
    });

    console.log("Cloudinary upload successful:");
    console.log("Public ID:", result.public_id);
    console.log("URL:", result.secure_url);

    return result.secure_url;
  } catch (error) {
    throw new AppError(
      error.message || "Image upload failed",
      error.http_code || 500
    );
  }
}