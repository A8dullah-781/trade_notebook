import pool from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";

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