import { ApiError } from "../utils/ApiError.js";
import multer from "multer";

//ErrorHandler middleware me agar error ApiError ka instance hai to uska status code or message send karte hai. Agar error ApiError ka instance nahi hai to iska status code 500 or message "Something went wrong" send karte hai.

export function errorHandler(err, req, res, next) {
  //agar humne is error ko throw kiya hai to uska status code or message send krdo
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // multer ka apna error hai (ApiError nahi), isliye alag se check karte hai
  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "Image must be 5 MB or smaller",
    });
  }

  console.error(err);

  // agar humne is error ko throw nahi kiya hai to iska status code 500 or message "Something went wrong" send krdo
  return res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
}