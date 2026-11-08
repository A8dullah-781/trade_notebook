import { ApiError } from "./ApiError.js";

export function getSignedPnl(direction, entryPrice, exitPrice, amount) {
  // 1. Direction must be long or short
  if (direction !== "long" && direction !== "short") {
    throw new ApiError(400, "Direction must be long or short");
  }

  // 2. Convert to numbers (inputs may arrive as strings)
  const entry = Number(entryPrice);
  const exit = Number(exitPrice);
  const money = Number(amount);

  // 3. Breakeven: price didn't move
  if (entry === exit) return 0;

  // 4. Long wins when price goes up. Short wins when price goes down.
  const isWin = direction === "long" ? exit > entry : exit < entry;

  // 5. Win = positive amount, loss = negative amount
  return isWin ? money : -money;
}

 // we are calculating the risk to reward ratio sl tp and entry
export function getRStats(direction, entry, stopLoss, takeProfit, exit) {
 
  const e = Number(entry);
  const sl = Number(stopLoss);
  const tp = Number(takeProfit);
  const ex = Number(exit);

  const isLong = direction === "long";

  const risk = isLong ? e - sl : sl - e;

  // Stop at or past entry: R can't be calculated
  if (risk <= 0) {
    return { planned_rr: null, result_r: null };
  }

  const reward = isLong ? tp - e : e - tp;
  const profitDistance = isLong ? ex - e : e - ex;

  return {
    planned_rr: Number((reward / risk).toFixed(2)),
    result_r: Number((profitDistance / risk).toFixed(2)),
  };
}
 // the final risk to reward when user exited
export function withR(trade) {
  const { planned_rr, result_r } = getRStats(
    trade.direction,
    trade.entry_price,
    trade.stop_loss,
    trade.take_profit,
    trade.exit_price,
  );

  return { ...trade, planned_rr, result_r };
}