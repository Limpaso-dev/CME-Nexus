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

export const uploadBufferToCloudinary = (file, folder) =>
  new Promise((resolve, reject) => {
    ensureCloudinaryConfig();

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
        use_filename: true,
        unique_filename: true
      },
      (error, result) => {
        if (error) {
          reject(error);
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
      }
    );

    Readable.from(file.buffer).pipe(stream);
  });
