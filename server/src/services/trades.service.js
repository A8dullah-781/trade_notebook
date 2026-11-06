import pool from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { getSignedPnl } from "../utils/tradeMath.js";

export async function addTrade(userId, data) {
  // 1. Unpack the fields the controller sent
  const {
    pair,
    direction,
    entry_time,
    exit_time,
    entry_price,
    exit_price,
    stop_loss,
    take_profit,
    amount,
    strategy_id,
    followed_strategy,
  } = data;

  // 2. Signed amount: +amount for a win, -amount for a loss, 0 for breakeven
  //    (argument order must match the function: direction first)
  const pnl = getSignedPnl(direction, entry_price, exit_price, amount);

  try {
    // 3. Insert. 12 columns, 12 placeholders, 12 values in the same order.
    const result = await pool.query(
      `INSERT INTO trades
        (user_id, pair, direction, entry_time, exit_time,
         entry_price, exit_price, stop_loss, take_profit,
         pnl_amount, strategy_id, followed_strategy)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [
        userId,
        pair,
        direction,
        entry_time,
        exit_time,
        entry_price,
        exit_price,
        stop_loss,
        take_profit,
        pnl,
        strategy_id,
        followed_strategy,
      ]
    );

    // 4. One trade was created, so return the first (only) row
    return result.rows[0];
  } catch (err) {
    // 23503 = foreign key violation: pair doesn't exist, or strategy isn't yours
    if (err.code === "23503") {
      throw new ApiError(400, "Invalid pair or strategy");
    }
    throw err;
  }
}