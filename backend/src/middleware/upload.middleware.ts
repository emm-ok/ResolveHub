import multer from "multer";

const storage = multer.memoryStorage();

const IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

interface UploadConfig {
  allowedMimeTypes: string[];
  maxFileSize: number;
  maxFiles?: number;
}

const createUpload = ({
  allowedMimeTypes,
  maxFileSize,
  maxFiles = 10,
}: UploadConfig) => {
  return multer({
    storage,

    limits: {
      fileSize: maxFileSize,
      files: maxFiles,
    },

    fileFilter: (_req, file, cb) => {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(
          new Error(`Unsupported file type: ${file.mimetype}`)
        );
      }

      cb(null, true);
    },
  });
};


export const uploadImages = createUpload({
  allowedMimeTypes: IMAGE_TYPES,
  maxFileSize: 10 * 1024 * 1024,
  maxFiles: 20,
});

export const uploadDocuments = createUpload({
  allowedMimeTypes: DOCUMENT_TYPES,
  maxFileSize: 20 * 1024 * 1024,
  maxFiles: 10,
});

export const uploadVideos = createUpload({
  allowedMimeTypes: VIDEO_TYPES,
  maxFileSize: 100 * 1024 * 1024,
  maxFiles: 5,
});