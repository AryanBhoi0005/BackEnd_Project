import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

import { v2 as cloudinary } from 'cloudinary';

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View Credentials' below to copy your API secret
    });
    
    const uploadOnCloudinary=async (localFilePath)=>{

        try{  //If FilePath Doesn't exist
           if(!localFilePath) return null
           const response=await cloudinary.uploader
       .upload(localFilePath,{
          resource_type:"auto"
       })
       //File has been uploaded 
       console.log("File is uploaded on CLoudinary",response.url);
       return response;
        }catch(error){
        fs.unlinkSync(localFilePath) //remove the locally saved temp file as an error has occured or file upload has failed 
        return null;
        }
    }

    export {uploadOnCloudinary}
    