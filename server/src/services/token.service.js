import pool from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { hashToken } from "../utils/tokens.js";

export async function verifyEmailToken(rawToken) {
  const tokenHash = hashToken(rawToken);

  const result = await pool.query(
    `SELECT id, user_id, type, new_email, expires_at, used_at
     FROM email_tokens
     WHERE token_hash = $1`,
    [tokenHash]
  );
  const row = result.rows[0];

  if (!row || (row.type !== "verify" && row.type !== "change_email")) {
    throw new ApiError(400, "Link is invalid");
  }
  if (row.used_at !== null) {
    throw new ApiError(400, "This link was already used");
  }
  if (new Date(row.expires_at) < new Date()) {
    throw new ApiError(400, "This link has expired");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `UPDATE email_tokens SET used_at = now() WHERE id = $1`,
      [row.id]
    );

    if (row.type === "verify") {
      await client.query(
        `UPDATE users SET email_verified = true WHERE id = $1`,
        [row.user_id]
      );
    } else {
      await client.query(
        `UPDATE users SET email = $1 WHERE id = $2`,
        [row.new_email, row.user_id]
      );
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    if (err.code === "23505") {
      throw new ApiError(409, "Email already in use");
    }
    throw err;
  } finally {
    client.release();
  }

  return row.type;
}