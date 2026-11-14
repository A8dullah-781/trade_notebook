import { asyncHandler } from "../utils/asyncHandler.js"; 
import { ApiResponse } from "../utils/ApiResponse.js"; 

import { getDashboardSummary, getDashboardCalendar } from "../services/dashboard.service.js";

export const getDSummary = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { month } = req.query;

  const data = await getDashboardSummary(userId, month);

  return new ApiResponse(200, data, "Dashboard summary").send(res);
});

export const gDCalendar = asyncHandler(async (req, res) => {
  const data = await getDashboardCalendar(req.user.id, req.query.month);
  return new ApiResponse(200, data, "Calendar loaded").send(res);
});