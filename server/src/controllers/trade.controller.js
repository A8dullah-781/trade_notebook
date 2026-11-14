import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateTrade } from "../utils/validateTrade.js";
import { removeScreenshot, updateScreenshot } from "../services/trades.service.js";
import { addTrade, deleteTrade, getTrade, getTradedPairs, updateTrade,
} from "../services/trades.service.js";
import { getMe } from "../services/me.service.js";


async function getZone(userId, tz) {
  if (tz === undefined || tz === null) {
    const user = await getMe(userId);
    return user.timezone;
  }

  if (typeof tz !== "string" || tz.trim() === "") {
    throw new ApiError(400, "Invalid timezone");
  }

  return tz.trim();
}

export const aTrade = asyncHandler(async (req, res) => {
  const zone = await getZone(req.user.id, req.body.tz);
  const tradeData = validateTrade(req.body, zone);

  const trade = await addTrade(req.user.id, tradeData);

  new ApiResponse(201, trade, "Trade saved").send(res);
});

export const gTrades = asyncHandler(async (req, res) => {
  const { from, to, pair, range, page } = req.query;

  if (from !== undefined && Number.isNaN(new Date(from).getTime())) {
    throw new ApiError(400, "Invalid date filter");
  }

  if (to !== undefined && Number.isNaN(new Date(to).getTime())) {
    throw new ApiError(400, "Invalid date filter");
  }

  const cleanPair = pair ? pair.trim().toUpperCase() || null : null;

  if (range !== "week" && range !== "month" && range !== undefined) {
    throw new ApiError(400, "Range must be week or month");
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

export const uTrade = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const tradeId = Number(req.params.id);

  if (!Number.isInteger(tradeId) || tradeId < 1) {
    throw new ApiError(400, "Invalid trade id");
  }

  const zone = await getZone(userId, req.body.tz);
  const tradeData = validateTrade(req.body, zone);

  const updatedTrade = await updateTrade(userId, tradeId, tradeData);

  new ApiResponse(200, updatedTrade, "Trade updated").send(res);
});

export const uScreenshot = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const tradeId = Number(req.params.id);

  if (!Number.isInteger(tradeId) || tradeId < 1) {
    throw new ApiError(400, "Invalid trade id");
  }

  if (!req.file) {
    throw new ApiError(400, "Screenshot file is required");
  }

  const trade = await updateScreenshot(userId, tradeId, req.file.buffer);

  new ApiResponse(200, trade, "Screenshot saved").send(res);
});

export const rScreenshot = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const tradeId = Number(req.params.id);

  if (!Number.isInteger(tradeId) || tradeId < 1) {
    throw new ApiError(400, "Invalid trade id");
  }

  const trade = await removeScreenshot(userId, tradeId);

  new ApiResponse(200, trade, "Screenshot removed").send(res);
});   


