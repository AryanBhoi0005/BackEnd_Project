import {asyncHandler} from "../utils/asyncHandler.js "
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponses.js";
import JsonWebTokenError  from "jsonwebtoken";
import { response } from "express";
import mongoose from "mongoose";

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
    if(!incomingRefreshToken){
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
           //Check between new refresh token and the one that is stored in DB
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
                {accessToken,refreshToken:newrefreshToken},
                 "Access Token refreshed"
            )
           )
    } catch (error) {
        throw new ApiError(401,error?.message||
            "Invalid refresh token")
    }
 })

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    //You can take as many fields from the user as  you want 
    //If want to add confirm password too then just add the field {oldpass,newpass,confirmpass}
    const{oldPassword,newPassword}=req.body

    /*
    const{oldPassword,newPassword,confPassword}=req.body
    if(!(newPassword==confPassword)){
       throw new ApiError(401,"Password is not same")
    }
       */

    //If user is changing the password he is already logged in and so we can get his data from req.body
    const user=await User.findById(req.user?._id)
    //Returns true or false value 
    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword);
    if(!isPasswordCorrect){
        throw new ApiError(400,"Invalid old Password")
    }
    //new Password is created 
    user.password=newPassword
    //user.save() is called to save the password and so pre hook is called which before saving hashes the password 
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Password Changed Successfully"))
})

const getCurrentUser=asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            req.user,
            "Current user fetched successfully"
        )
    )
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
    const {fullName,email} =req.body
    if(!fullName || !email){
        throw new ApiError(400,"All fields are required")
    }
    //Callin mongoDB operators
    const user= await User.findByIdAndUpdate(
        req.user?._id,
        {
             $set:{
                fullName:fullName,
                email:email
             }
        },
        {new:true} //returns updated information
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"Account details updated succcessfully"))
})

const updateUserAvatar=asyncHandler(async(req,res)=>{
    //Using multer
    const avatarLocalPath=req.files?.path
    //We can also store the image in localPath not necessary that we need cloudinary 
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is missing")
    }
    const avatar=await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400,"Error while updating avatar")
    }
    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            //Set is used bcoz we need so update specific obj not every value 
            $set:{
                avatar:avatar.url
            }
        },{new:true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Avatar updated successfuly")
    )
})

const updateUserCoverIamge=asyncHandler(async(req,res)=>{
    //Using multer and not files just file as single file
    const coverImageLocalPath=req.file?.path
    //We can also store the image in localPath not necessary that we need cloudinary 
    if(!coverImageLocalPath){
        throw new ApiError(400,"Cover Image file is missing")
    }
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400,"Error while updating avatar")
    }
    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            //Set is used bcoz we need so update specific obj not every value 
            $set:{
                coverImage:coverImage.url
            }
        },{new:true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Cover Image updated successfuly")
    )
})

const getUserChannelProfile=asyncHandler(async(req,res)=>{
    //When we need profile we usually visit channel url
    //params is used to get info from its url
       const {username}=req.params
       if(!username?.trim()){
        throw new ApiError(400,"username is missing")
       }
    //Aggregate pipeline return arrays
       const channel=await User.aggregate([
        //Stage 1
         {
            $match:{
                username:username?.toLowerCase()
            }
         },
        //Stage 2
         {   
            //subs model is the doc created everytime we sub channel
            $lookup:{
                //We convert Subscription to below field as in mongo it turns to lowercase and pural
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
         },
         //Stage 3
         {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
         },
         //Stage 4
         {
            $addFields:{
                subscribersCount:{
                    //returns count of subs with size
                    $size:"$subscribers"
                },
                channelsSubscribedToCount:{
                    $size:"$subscribedTo"
                },
                //To check if we are subs or not to a channel
                isSubscribed:{
                    $cond:{
                        if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                //if subs place it in false else add in subs
                        then:true,
                        else:false
                    }
                }
            }
         },
         {
        //Projection of user profile as per our req
        //1 here states we want to include that field
        //Similarly 0 to exclude that field
            $project:{
            fullName:1,
            username:1,
            subscribersCount:1,
            channelsSubscribedToCount:1,
            isSubscribed:1,
            avatar:1,
            coverImage:1,
            email:1
         }

         }

       ])

       if(!channel?.length){
          throw new ApiError(404,"channel does not exist")
       }
       return res.status(200)
       .json(
        new ApiResponse(200,channel[0],"User channel fetched successfully")
       )
})

const getWatchHistory=asyncHandler(async(req,res)=>{
    const user=await User.aggregate([
    //Stage 1
     {
        $match:{
            _id:new mongoose.Types.ObjectId(req.user._id)
        }
     },
    //Stage 2
     {
        $lookup:{
            from:"videos",
            localField:"watchHistory",
            foreignField:"_id",
            as:"watchHistory",
            //Adding sub pipeline
            pipeline:[
                {
                    $lookup:{
                        from:"users",
                        localField:"owner",
                        foreignField:"-id",
                        as:"owner",
                        pipeline:[
                            {
                                $project:{
                                    fullName:1,
                                    username:1,
                                    avatar:1
                                }
                            }
                        ]
                    }
                },
                {//The data is stored in owner field
                  $addFields:{
                    owner:{
                        $first:"$owner"
                    }
                  }
                }
            ]
        }
     },
    //Stage 3
     {

     }
    ])

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            user[0].getWatchHistory,
            "Watch History fetched successfully"
        )
    )
})



export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverIamge,
    getUserChannelProfile,
    getWatchHistory

}