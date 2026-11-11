import { getMe, updateMe } from "../services/me.service.js";
import { isValidTimezone } from "../services/timezone.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { changeUserPassword } from "../services/me.service.js";

export const me = asyncHandler(async (req, res)=>{
   const {id} = req.user

   const user = await getMe(id)

   new ApiResponse(200, user, "Profile fetched").send(res);
});

export const uMe = asyncHandler(async (req, res) => {
  const { name, timezone } = req.body;

  if (typeof name !== "string" || name.trim() === "" || name.trim().length > 30) {
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

  await changeUserPassword(req.user.id, currentPassword, newPassword);

  new ApiResponse(200, null, "Password updated").send(res);
});

export const changeEmail = asyncHandler(async (req, res) => {
  const { newEmail, currentPassword } = req.body;

  if (
    typeof newEmail !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim())
  ) {
    throw new ApiError(400, "A valid new email is required");
  }

  if (typeof currentPassword !== "string" || currentPassword === "") {
    throw new ApiError(400, "Current password is required");
  }

  await requestEmailChange(req.user.id, newEmail, currentPassword);

  new ApiResponse(200, null, "We sent a link to your new email").send(res);
});