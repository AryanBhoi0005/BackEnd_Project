import multer from "multer";

const storage = multer.diskStorage({
    //req-Req from user 
    //file -All files stored
    //cb- Callback
    destination: function (req, file, cb) {
      cb(null,"C:/Users/Aryan Bhoi/Desktop/BackEnd/L_5_BackEnd_/public/temp")
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
  export const upload = multer({storage })