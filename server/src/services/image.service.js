import { cloudinary } from "../config/cloudinary.js";

export function uploadImage(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "trade-notebook", resource_type: "image" },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );

    stream.end(buffer);
  });
}

export async function deleteImage(publicId) {
  if (!publicId) {
    return;
  }

  await cloudinary.uploader.destroy(publicId);
}