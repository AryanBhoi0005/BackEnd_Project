import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema=new Schema({
    videoFile:{
        type:String,  //String from Cloudnary
        required:true
    },
    thumbnail:{
        type:String,  //String from Cloudnary
        required:true
    },
    title:{
        type:String,  
        required:true
    },
    description:{
        type:String,  
        required:true
    },
    duration:{
        type:Number, //From Cloudnary
        required:true
    },
    view:{
        type:Number,
        default:0
    },
    isPublished:{
        type:Boolean,
        default:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

videoSchema.plugin(mongooseAggregatePaginate)
//Now we can use aggregation Queries

export const Video=mongoose.model("Video",videoSchema)