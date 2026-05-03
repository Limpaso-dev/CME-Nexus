import { Readable } from "stream";
import cloudinary from "../config/cloudinary.js";

const ensureCloudinaryConfig = () => {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new Error("Cloudinary environment variables are missing");
  }
};

const getResourceType = (mimeType = "") => {
  if (mimeType.startsWith("video/")) {
    return "video";
  }

  if (mimeType.startsWith("image/") || mimeType === "application/pdf" || mimeType === "application/x-pdf") {
    return "image";
  }

  return "raw";
};

export const uploadBufferToCloudinary = (file, folder) =>
  new Promise((resolve, reject) => {
    ensureCloudinaryConfig();
    const resourceType = getResourceType(file.mimetype);
    const isLargeVideo = resourceType === "video" && file.size > 100 * 1024 * 1024;

    const handleResult = (error, result) => {
      if (error) {
        const message =
          error.message?.includes("File size too large")
            ? "Cloudinary rejected the file because it is too large for the current upload method or plan."
            : error.message || "Cloudinary upload failed";

        reject(new Error(message));
        return;
      }

      resolve({
        url: result.secure_url,
        publicId: result.public_id,
        resourceType: result.resource_type,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size
      });
    };

    const streamFactory = isLargeVideo
      ? cloudinary.uploader.upload_chunked_stream.bind(cloudinary.uploader)
      : cloudinary.uploader.upload_stream.bind(cloudinary.uploader);

    const stream = streamFactory(
      {
        folder,
        resource_type: resourceType,
        use_filename: true,
        unique_filename: true,
        chunk_size: isLargeVideo ? 6 * 1024 * 1024 : undefined
      },
      handleResult
    );

    Readable.from(file.buffer).pipe(stream);
  });
