import pool from "../config/db.js";
import { generateToken, hashToken } from "../utils/tokens.js";
import { ApiError } from "../utils/ApiError.js";

export async function createEmailToken(userId, type, newEmail = null) {
  const rawToken = generateToken();
  const tokenHash = hashToken(rawToken);

  const hours = type === "reset" ? 1 : 24;
  const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);

  await pool.query(
    `INSERT INTO email_tokens (user_id, type, token_hash, new_email, expires_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, type, tokenHash, newEmail, expiresAt]
  );

  return rawToken;
}

export async function verifyEmailToken(rawToken) {
  const tokenHash = hashToken(rawToken);

  const result = await pool.query(
    `SELECT id, user_id, type, expires_at, used_at
     FROM email_tokens
     WHERE token_hash = $1`,
    [tokenHash]
  );
  const row = result.rows[0];

  if (!row || row.type !== "verify") {
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
    await client.query(
      `UPDATE users SET email_verified = true WHERE id = $1`,
      [row.user_id]
    );

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}