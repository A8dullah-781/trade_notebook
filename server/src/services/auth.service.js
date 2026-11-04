import bcrypt from "bcrypt";
import pool from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from 'jsonwebtoken'

export async function signupUser({ name, email, password }) {
  // 1. Hash the password
  const passwordHash = await bcrypt.hash(password, 10);

  // 2. Borrow one connection from the pool
  const client = await pool.connect();

  try {
    // 3. Start the transaction
    await client.query("BEGIN");

    // 4. Insert the user. RETURNING gives us the new row (we need its id)
    const userResult = await client.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [name, email, passwordHash]
    );
    const user = userResult.rows[0];

    // 5. Insert the 3 default strategies for this user
    const defaultStrategies = ["Trend pullback", "Reversal", "Breakout"];
    for (const strategyName of defaultStrategies) {
      await client.query(
        `INSERT INTO strategies (user_id, name) VALUES ($1, $2)`,
        [user.id, strategyName]
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
    [email]
  );

  const user = result.rows[0];
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: "7d"})

  return {user:{ id: user.id, name: user.name, email: user.email }, token};
}