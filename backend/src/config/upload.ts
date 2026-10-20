import multer from "multer";
import cloudinary from "./cloudinary.js";

// interface CloudinaryUploadOptions {
//   folder: string;
//   resourceType?: "image" | "video" | "raw" | "auto";
//   publicId?: string;
// }

// export const uploadToCloudinary = (
//   buffer: Buffer,
//   options: CloudinaryUploadOptions
// ) => {
//   return new Promise((resolve, reject) => {
//     const stream = cloudinary.uploader.upload_stream(
//       {
//         folder: options.folder,
//         resource_type: options.resourceType ?? "auto",
//         ...(options.publicId !== undefined && { public_id: options.publicId }),
//       },
//       (error, result) => {
//         if (error) {
//           return reject(error);
//         }

//         resolve(result);
//       }
//     );

//     stream.end(buffer);
//   });
// };


const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/plain",
]);

export const evidenceUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
    fields: 5,
    parts: 6,
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(
        new Error(
          "Unsupported evidence type. Upload PDF, JPEG, PNG, WEBP, or TXT.",
        ),
      );
      return;
    }

    callback(null, true);
  },
});
