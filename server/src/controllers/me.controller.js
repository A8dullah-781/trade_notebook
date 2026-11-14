import {
  getMe,
  updateMe,
  changePassword,
  forgotPassword,
  resetPassword,
  changeTheEmail,
  removeAvatar,
} from "../services/me.service.js";
import bcrypt from "bcrypt";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { isDisposableEmail } from "disposable-email-domains-js";
import { updateAvatar } from "../services/me.service.js";

export const gMe = asyncHandler(async (req, res) => {
  const { id } = req.user;

  const user = await getMe(id);

  new ApiResponse(200, user, "Profile fetched").send(res);
});

export const uMe = asyncHandler(async (req, res) => {
  const { name, timezone } = req.body;

  if (
    typeof name !== "string" ||
    name.trim() === "" ||
    name.trim().length > 30
  ) {
    throw new ApiError(400, "Name is required, max 30 characters");
  }

  let finalTimezone = "UTC";

  if (typeof timezone === "string" && timezone.trim() !== "") {
    const valid = await isValidTimezone(timezone.trim());
    if (!valid) {
      throw new ApiError(400, "Timezone is not valid");
    }
    finalTimezone = timezone.trim();
  }

  const userId = req.user.id;

  const result = await updateMe(userId, name.trim(), finalTimezone);

  return new ApiResponse(200, result, "Profile updated").send(res);
});

//check current password and change to new password
export const changePass = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (typeof currentPassword !== "string" || currentPassword === "") {
    throw new ApiError(400, "Current password is required");
  }

  if (typeof newPassword !== "string" || newPassword.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  if (newPassword === currentPassword) {
    throw new ApiError(400, "New password must be different");
  }

  await changePassword(req.user.id, currentPassword, newPassword);

  new ApiResponse(200, null, "Password updated").send(res);
});

//request a password reset link to be sent
export const forgotPass = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (typeof email !== "string" || email.trim() === "") {
    throw new ApiError(400, "Email is required");
  }

  await forgotPassword(email);

  new ApiResponse(200, null, "If an account exists, we sent a reset link").send(
    res,
  );
});

//reset password with token and new password
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

export const changeEmail = asyncHandler(async (req, res) => {
  const { newEmail, currentPassword } = req.body;

  if (typeof newEmail !== "string") {
    throw new ApiError(400, "A valid new email is required");
  }

  const cleanEmail = newEmail.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(cleanEmail)) {
    throw new ApiError(400, "A valid new email is required");
  }

  if (isDisposableEmail(cleanEmail)) {
    throw new ApiError(400, "Please use a real email address");
  }

  if (typeof currentPassword !== "string" || currentPassword === "") {
    throw new ApiError(400, "Current password is required");
  }

  await changeTheEmail(req.user.id, cleanEmail, currentPassword);

  new ApiResponse(200, null, "We sent a link to your new email").send(res);
});

export const uAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Avatar image is required");
  }

  const user = await updateAvatar(req.user.id, req.file.buffer);

  new ApiResponse(200, user, "Avatar updated").send(res);
});

export const rAvatar = asyncHandler(async (req, res) => {
  const { id } = req.user;

  const user = await removeAvatar(id);

  new ApiResponse(200, user, "Avatar removed").send(res);
});