// require('dotenv').config({path:'C:/Users/Aryan Bhoi/Desktop/BackEnd/L_5_BackEnd_/public/temp/.env'})

import dotenv from 'dotenv'
import connectDB from "./db/index.js";
import { app } from './app.js';

dotenv.config({
    path:'C:\Users\Aryan Bhoi\Desktop\BackEnd\L_5_BackEnd_\.env'
})


connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running at port: ${process.env.PORT}`)
    } )
    app.on("error",(error)=>{             
        console.log("Errrr",error);
        throw error
    })
})
.catch((err)=>{
    console.log("Mongo DB connection failed",err);
})



// import express from "express";
// const app=express()

// (async()=>{
//   try{
//      await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//      app.on("error",(error)=>{
//         console.log("Errrr",error);
//         throw error
//      })
//       
//   }catch(error){
//     console.error("ERROR:",error)
//     throw err
//   }
// })()