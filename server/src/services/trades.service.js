import pool from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getSignedPnl, withR } from "../utils/tradeMath.js";
import { uploadImage, deleteImage } from "./image.service.js";

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
    notes,
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
         pnl_amount, strategy_id, followed_strategy, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
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
        notes,
      ],
    );

    // 4. One trade was created, so return the first (only) row
    return withR(result.rows[0]);

  } catch (err) {
    // 23503 = foreign key violation: pair doesn't exist, or strategy isn't yours
    if (err.code === "23503") {
      throw new ApiError(400, "Invalid pair or strategy");
    }
    throw err;
  }
};

export async function getTrade(userId, filters) {
  // CHANGE 1: unpack page too, default 1
  const { from = null, to = null, pair = null, page = 1 } = filters || {};

  // CHANGE 2 and 3: page size and rows to skip
  const limit = 20;
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `SELECT
        t.id, t.pair, t.direction, t.entry_time, t.exit_time,
        t.entry_price, t.exit_price, t.stop_loss, t.take_profit,
        t.pnl_amount, t.strategy_id, t.followed_strategy,
        t.screenshot_url, t.notes, t.created_at,
        s.name AS strategy_name
     FROM trades t
     JOIN strategies s ON s.id = t.strategy_id
     WHERE t.user_id = $1
       AND ($2::timestamptz IS NULL OR t.exit_time >= $2)
       AND ($3::timestamptz IS NULL OR t.exit_time <= $3)
       AND ($4::text IS NULL OR t.pair = $4)
     ORDER BY t.exit_time DESC, t.id DESC
     LIMIT $5 OFFSET $6`,
    // CHANGE 5: limit and offset are the 5th and 6th items
    [userId, from, to, pair, limit, offset],
  );

  return result.rows.map(withR);
}

export async function getTradedPairs(userId) {
  const result = await pool.query(
    `SELECT DISTINCT pair FROM trades WHERE user_id = $1 ORDER BY pair`,
    [userId],
  );

  return result.rows.map((r) => r.pair);
};

export async function deleteTrade(userId, tradeId) {
  const result = await pool.query(
    `DELETE FROM trades WHERE id = $2 AND user_id = $1 RETURNING id, screenshot_public_id`,
    [userId, tradeId],
  );

  if (result.rows.length === 0) {
    throw new ApiError(404, "Trade not found");
  }

  const { id, screenshot_public_id } = result.rows[0];

  // The row is already deleted. If Cloudinary fails, only log it.
  try {
    await deleteImage(screenshot_public_id);
  } catch (err) {
    console.error(
      `Could not delete Cloudinary image ${screenshot_public_id}:`,
      err,
    );
  }

  return id;
}

export async function updateTrade(userId, tradeId, data) {
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
    notes,
  } = data;

  const pnl = getSignedPnl(direction, entry_price, exit_price, amount);

  let result;
  try {
    result = await pool.query(
      `UPDATE trades SET
         pair = $1,
         direction = $2,
         entry_time = $3,
         exit_time = $4,
         entry_price = $5,
         exit_price = $6,
         stop_loss = $7,
         take_profit = $8,
         pnl_amount = $9,
         strategy_id = $10,
         followed_strategy = $11,
         notes = $12
       WHERE id = $13 AND user_id = $14
       RETURNING *`,
      [
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
        notes,
        tradeId,
        userId,
      ],
    );
  } catch (err) {
    if (err.code === "23503") {
      throw new ApiError(400, "Invalid pair or strategy");
    }
    throw err;
  }

  if (result.rows.length === 0) {
    throw new ApiError(404, "Trade not found");
  }

  return withR(result.rows[0]);
};

export async function updateScreenshot(userId, tradeId, buffer) {
  const found = await pool.query(
    `SELECT screenshot_public_id FROM trades WHERE id = $1 AND user_id = $2`,
    [tradeId, userId],
  );

  if (found.rows.length === 0) {
    throw new ApiError(404, "Trade not found");
  }

  const oldPublicId = found.rows[0].screenshot_public_id;

  const { url, publicId } = await uploadImage(buffer);

  const result = await pool.query(
    `UPDATE trades
     SET screenshot_url = $1, screenshot_public_id = $2
     WHERE id = $3 AND user_id = $4
     RETURNING *`,
    [url, publicId, tradeId, userId],
  );

  await deleteImage(oldPublicId);

  return withR(result.rows[0]);
};

export async function removeScreenshot(userId, tradeId) {
  const result = await pool.query(
    `SELECT screenshot_public_id FROM trades WHERE id = $1 AND user_id = $2`,
    [tradeId, userId],
  );

  if (result.rows.length === 0) {
    throw new ApiError(404, "Trade not found");
  }

  const oldImage = result.rows[0].screenshot_public_id;

  const resultTwo = await pool.query(
    `UPDATE trades
     SET screenshot_url = NULL, screenshot_public_id = NULL
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [tradeId, userId],
  );

  // The row is already updated. If Cloudinary fails, only log it.
  try {
    await deleteImage(oldImage);
  } catch (err) {
    console.error(`Could not delete Cloudinary image ${oldImage}:`, err);
  }

  return withR(resultTwo.rows[0]);
}