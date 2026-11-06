import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {addTrade}  from "../services/trades.service.js";

export const aTrade = asyncHandler(async (req, res) => {
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
  } = req.body;

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

  const prices = [entry_price, exit_price, stop_loss, take_profit, amount];
  if (
    prices.some((p) => {
      const n = Number(p);
      return Number.isNaN(n) || n <= 0;
    })
  ) {
    throw new ApiError(400, "Prices and amount must be positive numbers");
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

  const trade = await addTrade(req.user.id, {
  pair, direction, entry_time, exit_time, entry_price, exit_price,
  stop_loss, take_profit, amount, strategy_id: sid, followed_strategy,
});

new ApiResponse(201, trade, "Trade saved").send(res);
});
