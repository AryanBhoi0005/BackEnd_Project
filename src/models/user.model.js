import mongoose,{Schema} from "mongoose";
import bcrpyt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema= new Schema({
          username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true 
          },
          email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
          },
          fullName:{
            type:String,
            required:true,
            trim:true,
            index:true
          },
          avatar:{
            type:String, //Cloudnary Url
            required:true
          },
          coverImage:{
            type:String, //Cloudnary Url
          },
          watchHistory:[
            {
                type:Schema.Types.ObjectId,
                ref:"Video"
            }
        ],
        password:{
            type:String,
            required:[true,"Password is required"]
        },
        refreshToken:{
            type:String
        }

},{
    timestamps:true
})

userSchema.pre("save", async function(next) {
    if(!this.isModified("password")) return next()
    this.password=await bcrpyt.hash(this.password,10)
    next()
})
//Creating a Custom method func to check Password
userSchema.methods.isPasswordCorrect=async function(password) {
  return await bcrpyt.compare(password,this.password) //Returns True and Flase
} 
userSchema.methods.generateAccessToken=function(){
  return jwt.sign(
    {
      _id:this._id,
      email:this.email,
      username:this.username,
      fullName:this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}
//If this takes time you can use async and await 
userSchema.methods.generateRefreshToken=function(){
  return jwt.sign(
    {
      _id:this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}

/*  Here arrrow function is not used bcoz it 
 creates prbs and we cannot access  ModelSchemaFields and also it is a lengthy 
 funtion so use "async"  */
 /* Due to Pre everytime there is a change just before save, password is hashed so we use if condition to use hash only when data field is first created as password and password is updated */

export const User= mongoose.model("User",userSchema)