import {asyncHandler} from "../utils/asyncHandler.js "
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponses.js";

const registerUser=asyncHandler(async(req,res)=>{
      
    //Get user details from Frontend 
    //Validation -Not empty
    //Check if User already exist:email,Uname
    //Check for images and Avatar 
    //For FileHandling we use Multer
    //Upload them to cloudinary, avatar check
    //Create user object - create entry in DB
    // remove password and refresh token  
       //field from response
    //Check for user creation 
    //return response 
    
    //From UserSchema
    const {fullName,email,username,password}=req.body
    console.log("email:",email); //to print 
    // if(fullName==""){
    //     //Go and check what does it return 
    //   throw new ApiError(400,"fullname is required")
    // }
    if(
        [fullName,email,username,password].some(field=>field?.trim()==="")){
        throw new ApiError(400,"All fields Empty");
    }
    //To Validate User
    const existedUser=User.findOne({
        $or:[{username},{email}] //or operator
    })
    if(existedUser){
        throw new ApiError(409,"User with email or username already exist")
    }
    // ? is used which states if present it returns or else throws null
    const avatarLocalPath=req.files?.avatar[0]?.path;
    const coverImageLocalPath=req.files?.coverImage[0]?.path;
     
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required"); 
    }
    
    //Uploading in Cloudinary 
    const avatar=await uploadOnCloudinary(avatarLocalPath);
    const coverImage=await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400,"Avatar file is required");
    }
    //Storing the values in DB
     const user =await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
     })

     //Check if user is empty or not by userID
     const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
        //Ignore what we don't want 
     )
     if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user");
     }

     //Creating a API response once everything is created
     return res.status(201).json(
        new ApiResponse(200,createdUser,"User Registered Successfully")
     )

})

export {registerUser}