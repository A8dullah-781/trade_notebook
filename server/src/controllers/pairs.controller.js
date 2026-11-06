import { searchPairs } from "../services/pairs.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const sPairs = asyncHandler(async (req, res)=>{
    const q = (req.query.q?? "").trim()

    const pairs = await searchPairs(q)

    new ApiResponse(200, pairs, "Pairs fetched" ).send(res)
})