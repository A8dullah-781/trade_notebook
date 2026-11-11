import pool from "../config/db.js";

export const isValidTimezone = async (timezone) => {
  const result = await pool.query(
    "SELECT 1 FROM pg_timezone_names WHERE name = $1",
    [timezone]
  );
  return result.rowCount > 0;
};