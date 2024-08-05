import mongoose from "mongoose";
import express from "express";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try { 
    //Conencting MongoDb URL to this DB_NAME
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`, {
    });
    console.log(`\n MongoDb connected !! DB HOST: ${connectionInstance.connection.host}`);
// connectionInstance:This variable holds the Mongoose Connection object returned by mongoose.connect
// The host property specifically contains the hostname of the MongoDB server to which the application is connected.
  } catch (error) {
    console.error("MONGODB connection error", error);
    process.exit(1);  // If error then exit 
  }
};

export default connectDB;
