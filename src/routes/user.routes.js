import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
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


export default router