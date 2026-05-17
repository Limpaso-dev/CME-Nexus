import multer from "multer";

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/x-pdf",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation"
]);

const fileFilter = (_req, file, cb) => {
  if (allowedMimeTypes.has(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(new Error("Unsupported file type"));
};

export const uploadContentFiles = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 250 * 1024 * 1024
  }
}).fields([
  { name: "primaryAsset", maxCount: 1 },
  { name: "thumbnailAsset", maxCount: 1 },
  { name: "attachments", maxCount: 10 }
]);
