import { v2 as cloudinary } from "cloudinary";
import { getOwnedReceipt } from "@/lib/receiptValidation.mjs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const CLOUDINARY_IMAGE_OPTIONS = { resource_type: "image", type: "upload" };

export async function resolveOwnedReceipt(publicId, userId) {
  const asset = await cloudinary.api.resource(publicId, CLOUDINARY_IMAGE_OPTIONS);
  return getOwnedReceipt(asset, publicId, userId);
}

export function destroyReceipt(publicId) {
  return cloudinary.uploader.destroy(publicId, {
    ...CLOUDINARY_IMAGE_OPTIONS,
    invalidate: true,
  });
}
