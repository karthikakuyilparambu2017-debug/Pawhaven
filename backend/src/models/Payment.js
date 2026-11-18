import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        booking:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Booking",
            required:true,
        },
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
        razorpayOrderId:{
            type:String,
            required:true,
            unique:true,
        },
        razorpayPaymentId:{
            type:String,
            default:"",
        },
        amount:{
            type:Number,
            required:true,
            min:0,
        },
        currency:{
            type:String,
            default:"INR",
        },

        status:{
            type:String,
            enum:["PENDING","PAID","FAILED","REFUNDED"],
            default:"PENDING",
        },
        paymentMethod:{
            type:String,
            default:null,
        },
        paidAt:{
            type:Date,
            default:null,
        },
    },
    {
        timestamps:true,
    }
);

const Payment = mongoose.model("Payment",paymentSchema);

export default Payment;