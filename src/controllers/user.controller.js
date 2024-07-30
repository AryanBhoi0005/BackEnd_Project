import {asyncHandler} from "../utils/asyncHandler.js "
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponses.js";
import JsonWebTokenError  from "jsonwebtoken";

//We are going to use it over and over again so we are making it as methods
const generateAccessandRefreshTokens= async(userId)=>{ //Func takes in userID
    try{
         const user=await User.findById(userId)
         const accessToken=user.generateAccessToken()
         const refreshToken=user.generateRefreshToken()
         //Adding token to DB
         user.refreshToken= refreshToken
         //Saving the token in DB
         await user.save({validateBeforeSave:false})
         return{accessToken,refreshToken}
    }catch(error){
        throw new ApiError(500,"Something went wrong while generating refresh and access token")
    }
}

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
    // console.log("email:",email); 
    //to print 
    // if(fullName==""){
    //     //Go and check what does it return 
    //   throw new ApiError(400,"fullname is required")
    // }

    if(
        [fullName,email,username,password].some(field=>field?.trim()==="")){
        throw new ApiError(400,"All fields Empty");
    }
    //To Validate User
    const existedUser=await User.findOne({
        $or:[{username},{email}] //or operator
    })

    if(existedUser){
        throw new ApiError(409,"User with email or username already exist")
    }
    // console.log(req.files);

    // ? is used which states if present it returns or else throws null
    const avatarLocalPath=req.files?.avatar?.[0]?.path;
    console.log(req.files)
    const coverImageLocalPath=req.files?.coverImage?.[0]?.path;
    console.log(coverImageLocalPath)
    
    //using if else so if coverImage is not given
    //it doesn't throw error

    // let coverImageLocalPath;
    // if(req.files && Array.isArray(req.files.coverImage)&& req.files.coverImage.length>0){
    //     coverImageLocalPath=req.files.coverImage[0].path
    // }
    
     
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required"); 
    }
    
    //Uploading in Cloudinary 
    const avatar=await uploadOnCloudinary(avatarLocalPath);
    const coverImage=await uploadOnCloudinary(coverImageLocalPath);
    // console.log(avatar)

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

const loginUser = asyncHandler(async (req, res) => {
    // Taking data from user
    const { email, username, password } = req.body;

    // Log the incoming request body for debugging
    console.log("Request Body:", req.body);

    // Validate request body
    if (!username && !email) {
        throw new ApiError(400, "Username or email is required");
    }
    if (!password) {
        throw new ApiError(400, "Password is required");
    }

    // Finding username or email in DB
    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (!user) {
        throw new ApiError(404, "User doesn't exist");
    }

    // Password check
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = await generateAccessandRefreshTokens(user._id);

    // Fetch user without password and refresh token
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // Set cookie options
    const options = {
        httpOnly: true,
        secure: true
    };

    // Send response with cookies and user data
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, {
            user: loggedInUser,
            accessToken,
            refreshToken
        }, "User logged in successfully"));
});


//We can't log out user directly as we don't have any access to its id
 const logoutUser=asyncHandler(async(req,res)=>{
  await User.findByIdAndUpdate(
       req.user._id,
       { //Check and updates the fields req
        $set: {
            refreshToken:undefined
        }
       },
       {
        new:true
       }
   )
   const options={ 
    //Without these cookies are directly modified through frontend and now only through server side
    httpOnly:true,
    secure:true
   }
   return res.status(200)
   .clearCookie("accessToken",options)
   .clearCookie("refreshToken",options)
   .json(new ApiResponse(200,{},"User logged Out"))

 })

 const refreshAccessToken= asyncHandler(async(req,res)=>{
    //Acessing refresh token from cookies 
    const incomingRefreshToken=req.cookie.refreshToken || req.body.refreshToken
    if(incomingRefreshToken){
        throw new ApiError(401,"Unauthorized request")
    }
    // verifying refresh token
    try {
        const decodedToken=JsonWebTokenError.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET)
    
           const user=await User.findById(decodedToken?._id)
           if(!user){
            throw new ApiError(401,"Invalid refresh token")
           }
           if(incomingRefreshToken!==user?.refreshToken){
            throw new ApiError(401,"Refresh token is expired or used")
           }
    
           const options={
            httpOnly:true,
            secure:true
           }
           const {accessToken,newrefreshToken}=await generateAccessandRefreshTokens(user._id)
    
           return res
           .status(200)
           .cookie("accessToken",accessToken,options)
           .cookie("refreshToken",newrefreshToken,options)
           .json(
            new ApiResponse(
                200,
                {accessToken,newrefreshToken},
                 "Access Token refreshed"
            )
           )
    } catch (error) {
        throw new ApiError(401,error?.message||
            "Invalid refresh token")
    }
 })

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}