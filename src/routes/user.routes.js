import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";

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


export default router