// require('dotenv').config({path:'C:/Users/Aryan Bhoi/Desktop/BackEnd/L_5_BackEnd_/public/temp/.env'})

import dotenv from 'dotenv'
import connectDB from "./db/index.js";
import { app } from './app.js';

dotenv.config({
    path:'C:\Users\Aryan Bhoi\Desktop\BackEnd\L_5_BackEnd_\.env'
})

// The .then method is used to specify what should be done when a promise is fulfilled (i.e., when the asynchronous operation completes successfully). It takes up to two arguments:
// OnFulfilled (required): A function that is called when the promise is resolved. This function receives the result of the promise as its argument.
// OnRejected (optional): A function that is called if the promise is rejected (an error occurs). This function receives the error as its argument.

// The .catch method is used to specify what should be done if a promise is rejected. It takes one argument:
// OnRejected: A function that is called when the promise is rejected. This function receives the error as its argument.
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