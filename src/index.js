// require('dotenv').config({path:'C:/Users/Aryan Bhoi/Desktop/BackEnd/L_5_BackEnd_/public/temp/.env'})

import dotenv from 'dotenv'
import connectDB from "./db/index.js";

dotenv.config({
    path:'C:\Users\Aryan Bhoi\Desktop\BackEnd\L_5_BackEnd_\.env'
})


connectDB()



// import express from "express";
// const app=express()

// (async()=>{
//   try{
//      await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//      app.on("error",(error)=>{
//         console.log("Errrr",error);
//         throw error
//      })
//      app.listen(process.env.PORT,()=>{
//         console.log('App is listening on PORT',`${process.env.PORT}`)
//      })
//   }catch(error){
//     console.error("ERROR:",error)
//     throw err
//   }
// })()