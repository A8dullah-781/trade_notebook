import pool from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import bcrypt from 'bcrypt'

export async function getMe(userId) {
  const result = await pool.query(
    `SELECT id, name, email, timezone, email_verified FROM users WHERE id = $1`,
    [userId]
  );

  const user = result.rows[0];
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
}

export async function updateMe(userId, name, timezone) {
  const result = await pool.query(
    `UPDATE users
     SET name = $1, timezone = $2
     WHERE id = $3
     RETURNING id, name, email, timezone, avatar_url, email_verified`,
    [name, timezone, userId]
  );

  return result.rows[0];
} 

export async function changeUserPassword(userId, currentPassword, newPassword) {
  const result = await pool.query(
    `SELECT password_hash FROM users WHERE id = $1`,
    [userId]
  );

  const user = result.rows[0];

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password_hash);

  if (!isMatch) {
    throw new ApiError(400, "Current password is incorrect");
  }

  const newHash = await bcrypt.hash(newPassword, 10);

  await pool.query(
    `UPDATE users SET password_hash = $1 WHERE id = $2`,
    [newHash, userId]
  );
}

export async function requestEmailChange(userId, newEmail, currentPassword) {
  const result = await pool.query(
    `SELECT email, password_hash, email_verified FROM users WHERE id = $1`,
    [userId]
  );

  const user = result.rows[0];

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.email_verified) {
    throw new ApiError(403, "Verify your current email first");
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password_hash);

  if (!isMatch) {
    throw new ApiError(400, "Current password is incorrect");
  }

  const cleanEmail = newEmail.trim().toLowerCase();

  if (cleanEmail === user.email) {
    throw new ApiError(400, "That is already your email");
  }

  const taken = await pool.query(
    `SELECT id FROM users WHERE email = $1`,
    [cleanEmail]
  );

  if (taken.rows.length > 0) {
    throw new ApiError(409, "Email already in use");
  }

  const rawToken = await createEmailToken(userId, "change_email", cleanEmail);

  await sendChangeEmailLink(cleanEmail, rawToken);
}