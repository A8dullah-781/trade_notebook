import { ApiError } from "./ApiError.js";

export function validateTrade(body) {
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
  } = body;

  const fields = [
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
  ];

  //Falsy trap: !value also rejects 0 and false, so check undefined/null when those are valid.
  if (fields.some((f) => f === undefined || f === null)) {
    throw new ApiError(400, "All fields are required");
  }

  if (direction !== "long" && direction !== "short") {
    throw new ApiError(400, "Direction must be long or short");
  }

  //.some(): returns true if at least one array item passes the test.
  const prices = [entry_price, exit_price, stop_loss, take_profit];
  if (
    prices.some((p) => {
      const n = Number(p);
      return Number.isNaN(n) || n <= 0;
    })
  ) {
    throw new ApiError(400, "Prices must be positive numbers");
  }

  // Amount can be 0 (breakeven), so it has its own check.
  // Number("") is 0, so a blank string must be rejected separately.
  const amountNum = Number(amount);
  if (
    String(amount).trim() === "" ||
    Number.isNaN(amountNum) ||
    amountNum < 0
  ) {
    throw new ApiError(400, "Amount must be a number, 0 or more");
  }

  // SL can be trailed past entry, but never beyond TP. TP must be past entry.
  const entry = Number(entry_price);
  const sl = Number(stop_loss);
  const tp = Number(take_profit);

  if (direction === "long" && (sl > tp || tp <= entry)) {
    throw new ApiError(
      400,
      "For a long trade, take profit must be above entry and stop loss cannot be above take profit"
    );
  }

  if (direction === "short" && (sl < tp || tp >= entry)) {
    throw new ApiError(
      400,
      "For a short trade, take profit must be below entry and stop loss cannot be below take profit"
    );
  }

  // Breakeven: exit equals entry, so the amount must be 0.
  // Win or loss: the amount must be above 0 (the server sets the sign).
  const isBreakeven = Number(exit_price) === entry;

  if (isBreakeven && amountNum !== 0) {
    throw new ApiError(400, "Breakeven trade must have amount 0");
  }

  if (!isBreakeven && amountNum === 0) {
    throw new ApiError(400, "Amount must be above 0 for a win or a loss");
  }

  const entryTime = new Date(entry_time);
  const exitTime = new Date(exit_time);

  if (Number.isNaN(entryTime.getTime()) || Number.isNaN(exitTime.getTime())) {
    throw new ApiError(400, "Invalid Entry or Exit Time");
  }

  if (exitTime <= entryTime) {
    throw new ApiError(400, "Exit time must be after entry time");
  }

  const sid = Number(strategy_id);
  if (!Number.isInteger(sid) || sid <= 0) {
    throw new ApiError(400, "Invalid strategy");
  }

  if (typeof followed_strategy !== "boolean") {
    throw new ApiError(400, "Followed strategy must be true or false");
  }

  // Notes are optional. Missing, empty, or spaces-only all become null.
  let cleanNote = null;

  if (notes !== undefined && notes !== null) {
    const trimmed = String(notes).trim();
    cleanNote = trimmed || null; // empty string becomes null
  }

  // Only check the length when there is a note
  if (cleanNote !== null && cleanNote.length > 1000) {
    throw new ApiError(400, "Text should be under 1000 characters");
  }

  return {
    pair,
    direction,
    entry_time,
    exit_time,
    entry_price,
    exit_price,
    stop_loss,
    take_profit,
    amount,
    strategy_id: sid,
    followed_strategy,
    notes: cleanNote,
  };
}