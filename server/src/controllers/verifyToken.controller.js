import {asyncHandler} from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import { verifyEmailToken } from '../services/emailToken.service.js';
import { forgotPassword, resendVerificationEmail } from '../services/auth.service.js';
import {resetPassword} from '../services/auth.service.js'

export const verifyToken = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (typeof token !== "string" || token.trim() === "") {
    throw new ApiError(400, "Token is required");
  }

  await verifyEmailToken(token.trim());

  return new ApiResponse(200, null, "Email verified").send(res);
});

export const resendVEmail = asyncHandler(async (req, res) => {
      const {email} = req.body

      if( typeof email !== 'string' || email.trim() === ''){
            throw new ApiError(400, 'Email is required')
      }

      await resendVerificationEmail(email)

      new ApiResponse(200, null, 'If an account exists, we sent a new link').send(res)
});

export const forgotPass = asyncHandler(async (req, res) => {
      const {email} = req.body

      if( typeof email !== 'string' || email.trim() === ''){
            throw new ApiError(400, 'Email is required')
      }

      await forgotPassword(email)

      new ApiResponse(200, null, 'If an account exists, we sent a reset link').send(res)
});

export const resetPass = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (typeof token !== "string" || token.trim() === "") {
    throw new ApiError(400, "Token is required");
  }

  if (typeof newPassword !== "string" || newPassword.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  await resetPassword(token.trim(), newPassword);

  new ApiResponse(200, null, "Password updated").send(res);
});