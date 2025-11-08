import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


/**
 * Uploads a buffer (file from multer memory storage) to Cloudinary
 * @param {Buffer} fileBuffer - file buffer from multer
 * @param {string} folder - folder name in Cloudinary
 * @returns {Promise<string>} - secure_url of uploaded image
 */
export const uploadToCloudinary = (fileBuffer, folder = "uploads") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
};

export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`Cloudinary image deleted: ${publicId}`);
  } catch (error) {
    console.error("Cloudinary delete error:", error);
  }
};

export default cloudinary;