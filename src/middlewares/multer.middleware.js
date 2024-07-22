import multer from "multer";

const storage = multer.diskStorage({
    //req-Req from user 
    //file -All files stored
    //cb- Callback
    destination: function (req, file, cb) {
      cb(null,"./public/temp")
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
  export const upload = multer({storage, })