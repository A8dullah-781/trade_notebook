import bcrypt from "bcrypt";
import pool from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../services/email.service.js";
import { createEmailToken } from "./emailToken.service.js";
import { sendResetEmailPass } from "../services/email.service.js";
import { generateToken } from "../utils/tokens.js";
import { hashToken } from "../utils/tokens.js";

export async function signupUser({ name, email, password, timezone }) {
  // 1. Hash the password
  const passwordHash = await bcrypt.hash(password, 10);

  // 2. Borrow one connection from the pool
  const client = await pool.connect();

  try {
    // 3. Start the transaction
    await client.query("BEGIN");

    // 4. Insert the user. RETURNING gives us the new row (we need its id)
    const userResult = await client.query(
      `INSERT INTO users (name, email, password_hash, timezone)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, timezone`,
      [name, email, passwordHash, timezone],
    );
    const user = userResult.rows[0];

    // 5. Insert the 3 default strategies for this user
    const defaultStrategies = ["Trend pullback", "Reversal", "Breakout"];
    for (const strategyName of defaultStrategies) {
      await client.query(
        `INSERT INTO strategies (user_id, name) VALUES ($1, $2)`,
        [user.id, strategyName],
      );
    }

    // 6. Everything worked: make it final
    await client.query("COMMIT");

    return user;
  } catch (err) {
    // 7. Something failed: undo everything since BEGIN
    await client.query("ROLLBACK");

    // Duplicate email
    if (err.code === "23505") {
      throw new ApiError(409, "Email already registered");
    }

    // Anything else is unexpected
    throw err;
  } finally {
    // 8. Always give the connection back
    client.release();
  }
}

export async function loginUser({ email, password }) {
  const result = await pool.query(
    `SELECT id, name, email, password_hash FROM users WHERE lower(email) = $1`,
    [email],
  );

  const user = result.rows[0];
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return { user: { id: user.id, name: user.name, email: user.email }, token };
}

export async function resendVerificationEmail(email) {
  const cleanEmail = email.trim().toLowerCase();

  const result = await pool.query(
    "SELECT id, name, email, email_verified FROM users WHERE email = $1",
    [cleanEmail],
  );

  const user = result.rows[0];

  if (!user || user.email_verified) {
    return;
  }

  const rawToken = await createEmailToken(user.id, "verify");

  try {
    await sendVerificationEmail(user.email, rawToken);
  } catch (err) {
    console.error("Resend email failed:", err.message);
  }
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
    await sendResetEmailPass(user.email, rawToken);
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