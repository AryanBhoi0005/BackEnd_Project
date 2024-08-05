
//Try catch method

const asyncHandler=(fn)=> async(req,res,next)=>{
   try{
       await fn(req,res,next)
   }catch(error){ 
    res.status(err.code ||500).json({
       success:false,
       message:err.message
    })
   }
}
//.json is used for response to frontend



//Promises Method
// The function returned by asyncHandler is a middleware function that takes three parameters: req (request), res (response), and next (next middleware function).
// const asyncHandler=(requestHandler)=>{
//     return (req,res,next)=>{
//         Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
//     }
// }
 export {asyncHandler}

