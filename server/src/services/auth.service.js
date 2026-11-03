import bcrypt from "bcrypt";
import pool from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";

export async function signupUser({ name, email, password }) {
  // Hash the password. Never store the plain password.
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    // Just INSERT. The unique index on lower(email) is the real guard.
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [name, email, passwordHash]
    );

    // Return only the user. The controller adds the message.
    return result.rows[0];
  } catch (err) {
    // 23505 = PostgreSQL "unique violation" (email already exists)
    if (err.code === "23505") {
      throw new ApiError(409, "Email already registered");
    }

    // Anything else is unexpected. Pass it up unchanged.
    throw err;
  }
}