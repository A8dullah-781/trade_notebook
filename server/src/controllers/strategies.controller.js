import { getStrategies } from "../services/strategies.service.js";
import { createStrategies } from "../services/strategies.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export const strategies = asyncHandler(async (req, res)=>{
    const {id} = req.user
    const result = await getStrategies(id)
    
    new ApiResponse(200, result, "Strategies fetched").send(res)
})

export const cStrategies = asyncHandler(async (req, res)=>{
     const {id} = req.user
     const {name} = req.body

     if(!name?.trim() || name.trim().length > 50){
        throw new ApiError(400, 'Enter a valid name')
     }

     const result = await createStrategies(id, name.trim())

     new ApiResponse(201, result, 'Strategy Created').send(res)
})