//To verify if user exists or not 
import { ApiError } from "../utils/ApiError";
import {asyncHandler} from "../utils/asyncHandler.js";
import { jwt } from "jsonwebtoken";
import { User } from "../models/user.model.js";


//We are keeping response empty so "_"
export const verifyJWT =asyncHandler(async(req,_,next)=>{
    try {
        const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer","") //Send key and value this way in token as auth and bear
        if(!token){
        throw new ApiError(401,"Unauthorized request")
        }
        //Once we get the info from token we have to decode the info before using it
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        //We have to import secretAccess key as accesskey can only be decoded by it
    
        const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401,"Invalid Access Token")
        }
    
        req.user=user;
        next()
    } catch (error) {
        throw new ApiError(401,error?.message||"Invalid access token")
    }
})

