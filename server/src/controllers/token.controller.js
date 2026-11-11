import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { verifyEmailToken } from "../services/token.service.js";

export const verifyEToken = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (typeof token !== "string" || token.trim() === "") {
    throw new ApiError(400, "Token is required");
  }

  await verifyEmailToken(token.trim());

  return new ApiResponse(200, null, "Email verified").send(res);
});


       