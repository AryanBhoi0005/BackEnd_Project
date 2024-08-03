import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverIamge, getUserChannelProfile, getWatchHistory } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router()

router.route("/register").post(
    upload.fields([ //Now we can send Images 
         {
            name:"avatar",
            maxCount:1
        },
         {
            name:"coverImage",
            maxCount:1
         }
    ]),
    registerUser
)

router.route("/login").post(loginUser)

//Secured Routes
router.route("/logout").post(verifyJWT,logoutUser) 
//After verifyJWT next() is used to tell the control to run logoutUser function

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJWT,changeCurrentPassword)

router.route("/current-user").get(verifyJWT,getCurrentUser)

router.route("/update-account").patch(verifyJWT,updateAccountDetails)

router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)

router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updateUserCoverIamge)

//While using params we have to specify the name already specified no changes in it in a specific manner
router.route("/c/:username").get(verifyJWT,getUserChannelProfile)

router.route("/history").get(verifyJWT,getWatchHistory)


export default router