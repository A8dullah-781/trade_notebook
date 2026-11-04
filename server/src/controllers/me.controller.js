import { getMe } from "../services/me.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const me = asyncHandler(async (req, res)=>{
   const {id} = req.user

   const user = await getMe(id)

   new ApiResponse(200, user, "Profile fetched").send(res);
})