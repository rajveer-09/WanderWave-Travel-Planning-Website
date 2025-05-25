import { v2 as cloudinary } from "cloudinary";

// Use environment variables or fallback to hardcoded values as backup
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "dvbw76boh";
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || "988965663417232";
const CLOUDINARY_API_SECRET =
  process.env.CLOUDINARY_API_SECRET || "Vo8HobpUEydUNcPg8GNw916jupI";

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

export const uploadImage = async (file: string): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: "travel-planner",
    });
    return result.secure_url;
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw new Error("Failed to upload image");
  }
};

export default cloudinary;
