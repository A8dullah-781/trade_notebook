import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { addTrade, deleteTrade, getTrade, getTradedPairs } from "../services/trades.service.js";

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
    notes,
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

  const trade = await addTrade(req.user.id, {
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
    notes: cleanNote, // the cleaned value, not the raw one
  });

  new ApiResponse(201, trade, "Trade saved").send(res);
});

export const listTrades = asyncHandler(async (req, res) => {
  const { from, to, pair, range, page } = req.query;

  if (from !== undefined && Number.isNaN(new Date(from).getTime())) {
    throw new ApiError(400, "Invalid date filter");
  }

  if (to !== undefined && Number.isNaN(new Date(to).getTime())) {
    throw new ApiError(400, "Invalid date filter");
  }

  const cleanPair = pair ? pair.trim().toUpperCase() || null : null;


  if(range !== "week" && range !== "month" && range !== undefined){
    throw new ApiError(400, 'Range must be week or month')
  }

    // Turn range into a start date. Stays null when no range was sent.
  let finalFrom = from;

  if (range === "week") {
    finalFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  } else if (range === "month") {
    finalFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  }

    // Page defaults to 1 when not sent
  const defaultPage = page === undefined ? 1 : page;
  const pageInNum = Number(defaultPage);

  // Must be a whole number, 1 or higher
  if (!Number.isInteger(pageInNum) || pageInNum < 1) {
    throw new ApiError(400, "Page must be a positive whole number");
  }

    const list = await getTrade(req.user.id, {
    from: finalFrom,
    to,
    pair: cleanPair,
    page: pageInNum,
  });

  const pairs = await getTradedPairs(req.user.id);

  new ApiResponse(200, { trades: list, pairs }, "Trades fetched").send(res);
});

export const dTrade = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const tradeId = Number(req.params.id);

  if (!Number.isInteger(tradeId) || tradeId < 1) {
    throw new ApiError(400, "Invalid trade id");
  }

  const deletedId = await deleteTrade(userId, tradeId);

  new ApiResponse(200, { id: deletedId }, "Trade deleted").send(res);
});