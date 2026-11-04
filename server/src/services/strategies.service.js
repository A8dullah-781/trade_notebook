import pool from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";

export async function getStrategies(userId) {
  const result = await pool.query(
    `SELECT id, name FROM strategies WHERE user_id = $1 ORDER BY id`,
    [userId],
  );

  return result.rows;
}

export async function createStrategies(userId, name) {
  try {

    const result = await pool.query(
      `INSERT INTO strategies (user_id, name) VALUES ($1, $2) RETURNING id, name`,
      [userId, name],
    );

    return result.rows[0];

  } catch (err) {
    
    if(err.code === "23505"){
        throw new ApiError(409, "Strategy already exists");
    }

    throw err;
  }
}
