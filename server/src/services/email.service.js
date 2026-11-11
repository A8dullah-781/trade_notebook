import pool from "../config/db.js";
import { createEmailToken, sendVerificationEmail } from "./helper.service.js";

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



