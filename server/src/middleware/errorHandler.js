import { ApiError } from "../utils/ApiError.js";

//ErrorHandler middleware me agar error ApiError ka instance hai to uska status code or message send karte hai. Agar error ApiError ka instance nahi hai to iska status code 500 or message "Something went wrong" send karte hai.

export function errorHandler(err, req, res, next) {
  //agar humne is error ko throw kiya hai to uska status code or message send krdo
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  console.error(err);

  // agar humne is error ko throw nahi kiya hai to iska status code 500 or message "Something went wrong" send krdo
  return res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
}
