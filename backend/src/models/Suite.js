import mongoose from "mongoose";

const SuiteSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
    },
    description:{
        type:String,
        trim:true,
        default:"",
    },
    type:{
        type:String,
        enum:["STANDARD","PREMIUM","VIP"],
        required:true,
    },
    capacity:{
        type:Number,
        required:true,
        min:1,
    },
    pricePerDay:{
         type:Number,
        required:true,
        min:0,
    },
    amenities:[
        {
            type:String,
            trim:true,
        },
    ],
    image:{
        type:String,
        default:"",
    },
    isAvailable:{
        type:Boolean,
        default:true
    },
},{
    timestamps:true,
});
const Suite=mongoose.model("Suite",SuiteSchema);
export default Suite;