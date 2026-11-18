import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },
    password:{
        type:String,
        required:true,
        minlength:6,
    },
    role:{
        type:String,
        enum:["PET_OWNER","STAFF","VETERINARIAN","ADMIN"],
        default:"PET_OWNER",
    },
    profileImage:{
        type:String,
        default:"",
    },
    isActive:{            //whether the account is active
        type:Boolean,
        default:true,
    },
    resetPasswordToken: {
  type: String,
  default: null,
},

resetPasswordExpires: {
  type: Date,
  default: null,
},
},{
    timestamps:true,
});

const User=mongoose.model("User",userSchema);
export default User;