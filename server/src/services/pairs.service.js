import pool from "../config/db.js";

export async function searchPairs(q) {
  // 1. Nothing typed: show the popular pairs (ranks 1 to 10)
  if (!q) {
    const popular = await pool.query(
      `SELECT symbol, name, category FROM pairs
       WHERE popular_rank IS NOT NULL
       ORDER BY popular_rank
       LIMIT 10`
    );
    return popular.rows;
  }

  // 2. Something typed: search, with popular pairs first
  const result = await pool.query(
    `SELECT symbol, name, category FROM pairs
     WHERE symbol ILIKE $1 OR name ILIKE $1
     ORDER BY popular_rank NULLS LAST, symbol
     LIMIT 10`,
    [`%${q}%`]
  );
  return result.rows;
}