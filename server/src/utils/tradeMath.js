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