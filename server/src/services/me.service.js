import pool from "../config/db.js";
import { hashToken } from "../utils/tokens.js";
import bcrypt from "bcrypt";
import {
  createEmailToken,
  sendResetEmailPassEmail,
  sendChangeEmailLinkEmail,
} from "./helper.service.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";

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

export async function changePassword(userId, currentPassword, newPassword) {
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

export async function forgotPassword(email) {
  const cleanEmail = email.trim().toLowerCase();

  const result = await pool.query(
    `SELECT id, email FROM users WHERE email = $1`,
    [cleanEmail]
  );

  const user = result.rows[0];

  if (!user) {
    return;
  }

  const rawToken = await createEmailToken(user.id, "reset");

  try {
    await sendResetEmailPassEmail(user.email, rawToken);
  } catch (err) {
    console.error("Reset email failed:", err.message);
  }
}

export async function resetPassword(token, newPassword) {
  const tokenHash = hashToken(token);

  const result = await pool.query(
    `SELECT id, user_id, expires_at, used_at
     FROM email_tokens
     WHERE token_hash = $1 AND type = $2`,
    [tokenHash, "reset"]
  );

  const tokenRow = result.rows[0];

  if (!tokenRow) {
    throw new ApiError(400, "Link is invalid");
  }

  if (tokenRow.used_at) {
    throw new ApiError(400, "This link was already used");
  }

  if (tokenRow.expires_at < new Date()) {
    throw new ApiError(400, "This link has expired");
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const burned = await client.query(
      `UPDATE email_tokens
       SET used_at = NOW()
       WHERE id = $1 AND used_at IS NULL`,
      [tokenRow.id]
    );

    if (burned.rowCount === 0) {
      throw new ApiError(400, "This link was already used");
    }

    await client.query(
      `UPDATE users SET password_hash = $1 WHERE id = $2`,
      [passwordHash, tokenRow.user_id]
    );

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}        

export async function changeTheEmail(userId, newEmail, currentPassword) {
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

  await sendChangeEmailLinkEmail(cleanEmail, rawToken);
}