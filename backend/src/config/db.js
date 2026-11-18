import mongoose from "mongoose";

 async function connectDB(){
    try{
        await mongoose.connect(process.env.MONGO_URI),
        console.log("mongoDB connected successfully");
    } catch(error){
        console.error("mongoDB connectionfailed",error.message);
        throw error;
    }
    
}

export default connectDB;