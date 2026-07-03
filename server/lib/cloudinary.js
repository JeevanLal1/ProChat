import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file buffer directly to Cloudinary using streams.
 * @param {Buffer} fileBuffer - The file buffer from Multer.
 * @param {string} folder - The destination folder in Cloudinary.
 * @param {string} [resourceType="auto"] - The resource type (image, video, raw, auto).
 * @returns {Promise<object>} The Cloudinary upload response.
 */
export const uploadToCloudinary = (fileBuffer, folder, resourceType = "auto") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    Readable.from(fileBuffer).pipe(uploadStream);
  });
};

/**
 * Deletes an asset from Cloudinary by its public ID.
 * @param {string} publicId - The asset public ID.
 * @param {string} [resourceType="image"] - The resource type.
 * @returns {Promise<object>} The Cloudinary delete response.
 */
export const deleteFromCloudinary = (publicId, resourceType = "image") => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(
      publicId,
      { resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
  });
};

/**
 * Extracts the public ID from a Cloudinary URL.
 * @param {string} url - The secure URL of the asset.
 * @returns {string|null} The public ID or null.
 */
export const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;

    // Strip version segment (e.g. v1700000000/)
    const relativePath = parts[1].replace(/^v\d+\//, "");

    // Strip extension
    const dotIndex = relativePath.lastIndexOf(".");
    if (dotIndex !== -1) {
      return relativePath.substring(0, dotIndex);
    }
    return relativePath;
  } catch (err) {
    console.error("Error parsing public ID from Cloudinary URL:", err);
    return null;
  }
};

export default cloudinary;
