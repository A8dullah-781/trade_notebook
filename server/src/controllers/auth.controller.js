import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { signupUser, loginUser } from "../services/auth.service.js";
import {isValidTimezone} from '../services/timezone.service.js'
import { createEmailToken } from "../services/emailToken.service.js";
import { sendVerificationEmail } from "../services/email.service.js";

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, timezone } = req.body;

  // 1. Required fields
  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    throw new ApiError(400, "All fields are required");
  }

  // 2. Password length
  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters long.");
  }

  // 3. Name length
  if (name.trim().length > 50) {
    throw new ApiError(400, "Name cannot exceed 50 characters.");
  }

  // 4. Clean the email, then check its format
  const cleanEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    throw new ApiError(400, "Invalid email format.");
  }

  let finalTimezone = "UTC";

  if (typeof timezone === "string" && timezone.trim() !== "") {
    const valid = await isValidTimezone(timezone.trim());
    if (valid) {
      finalTimezone = timezone.trim();
    }
  }

  // 5. Call the service. If it throws, asyncHandler passes it to next(err)
  const user = await signupUser({
    name: name.trim(),
    email: cleanEmail,
    password,
    timezone: finalTimezone
  });

    try {
    const rawToken = await createEmailToken(user.id, "verify");
    await sendVerificationEmail(user.email, rawToken);
  } catch (err) {
    console.error("Verification email failed:", err.message);
  }

  // 6. Send the success response (status typed once)
  new ApiResponse(201, user, "Signup ok").send(res);
  //Controller me asyncHandler ke through ye error next(err) ke sath pass hota hai errorHandler middleware me.
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password?.trim()) {
    throw new ApiError(400, "All fields are required");
  }

  const cleanEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    throw new ApiError(400, "Invalid email format.");
  }

  const user = await loginUser({
    email: cleanEmail,
    password,
  });

  new ApiResponse(200, user, "Login ok").send(res);
});
