import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app=express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
app.use(express.json({limit:"16kb",limit:"16kb"}))
app.use(express.urlencoded({extended:true}))
app.use(express.static("public"))
app.use(cookieParser())




//routes
import userRouter from './routes/user.routes.js'

//Routes declaration 
app.use("/api/v1/users",userRouter) 

//Giving control to userRouter
// http://localhost:8000/users then route to user.routes 
// then we will http://localhost:8000/users/registers so it will call the route mentioned  

//We are simply passing the control to the user where we can add the route as per our requirements /login , /register





export {app}