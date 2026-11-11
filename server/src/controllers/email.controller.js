import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { resendVerificationEmail } from "../services/email.service.js";

export const resendVEmail = asyncHandler(async (req, res) => {
      const {email} = req.body

      if( typeof email !== 'string' || email.trim() === ''){
            throw new ApiError(400, 'Email is required')
      }

      await resendVerificationEmail(email)

      new ApiResponse(200, null, 'If an account exists, we sent a new link').send(res)
});
              