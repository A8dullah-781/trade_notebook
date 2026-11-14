import pool from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { getMonthRange } from "../utils/monthRange.js";
import {
  getBasicStats,
  getProfitFactor,
  getMaxDrawdown,
  getAverageR,
  getDisciplineStats
} from "../utils/dashboardMath.js";
import { withR } from "../utils/tradeMath.js";
import { toCents, fromCents } from "../utils/money.js";

export async function getDashboardSummary(userId, month) {
  const result = await pool.query(`SELECT timezone FROM users WHERE id = $1`, [
    userId,
  ]);

  const timezone = result.rows[0]?.timezone;

  if (!timezone) {
    throw new ApiError(404, "User not found");
  }

  const range = getMonthRange(month, timezone);
  const days = await getDailyTotals(userId, timezone, range.start, range.end);
  const rTrades = await getTradesForR(userId, range.start, range.end);
  const disciplineRows = await getDisciplineRows(
    userId,
    range.start,
    range.end,
  );

  const basic = getBasicStats(days);

  return {
    timezone,
    month: range.month,
    ...basic,
    profitFactor: getProfitFactor(days),
    maxDrawdown: getMaxDrawdown(days),
    avgR: getAverageR(rTrades),
    discipline: getDisciplineStats(disciplineRows),
    latestTrades: await getLatestTrades(userId),
  };
}

export async function getDailyTotals(userId, timezone, start, end) {
  const result = await pool.query(
    `SELECT
       to_char(exit_time AT TIME ZONE $2, 'YYYY-MM-DD') AS day,
       SUM(pnl_amount) AS total,
       COUNT(*) AS trades
     FROM trades
     WHERE user_id = $1
       AND exit_time >= $3
       AND exit_time < $4
     GROUP BY day
     ORDER BY day`,
    [userId, timezone, start, end],
  );

  return result.rows;
}

export async function getTradesForR(userId, start, end) {
  const result = await pool.query(
    `SELECT direction, entry_price, stop_loss, take_profit, exit_price
     FROM trades
     WHERE user_id = $1
       AND exit_time >= $2
       AND exit_time < $3`,
    [userId, start, end],
  );

  return result.rows;
}

export async function getDisciplineRows(userId, start, end) {
  const result = await pool.query(
    `SELECT
       followed_strategy,
       COUNT(*) AS trades,
       SUM(pnl_amount) AS total
     FROM trades
     WHERE user_id = $1
       AND exit_time >= $2
       AND exit_time < $3
     GROUP BY followed_strategy`,
    [userId, start, end]
  );

  return result.rows;
}

export async function getLatestTrades(userId) {
  const result = await pool.query(
    `SELECT t.id, t.pair, t.direction, t.entry_price, t.exit_price,
            t.stop_loss, t.take_profit, t.pnl_amount,
            t.followed_strategy, t.exit_time,
            s.name AS strategy_name
     FROM trades t
     JOIN strategies s ON s.id = t.strategy_id
     WHERE t.user_id = $1
     ORDER BY t.exit_time DESC, t.id DESC
     LIMIT 4`,
    [userId],
  );

  return result.rows.map((row) => {
    const trade = withR(row);
    return {
      id: row.id,
      pair: row.pair,
      direction: row.direction,
      strategyName: row.strategy_name,
      resultR: trade.result_r,
      pnl: fromCents(toCents(row.pnl_amount)),
      followed: row.followed_strategy,
      exitTime: row.exit_time,
    };
  });
}

export async function getDashboardCalendar(userId, month) {
  const result = await pool.query(`SELECT timezone FROM users WHERE id = $1`, [
    userId,
  ]);

  const timezone = result.rows[0]?.timezone;

  if (!timezone) {
    throw new ApiError(404, "User not found");
  }

  const range = getMonthRange(month, timezone);
  const dailyTotals = await getDailyTotals(
    userId,
    timezone,
    range.start,
    range.end,
  );

  const days = dailyTotals.map((d) => {
  const cents = toCents(d.total);
  return {
    day: d.day,
    total: fromCents(cents),
    tradeCount: Number(d.trades),
    color: cents > 0 ? "green" : cents < 0 ? "pink" : "grey",
  };
});

  return { timezone, month: range.month, days };
}
