import mongoose from "mongoose"
const Paymentschema=mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,red:"User",required:true},
    username:{type:String,required:true},
    productname:{type:String,required:true},
    price:{type:String,required:true},
    quantity:{type:Number,required:true},
    total:{type:Number,required:true},
    date:{type:Date,required:true}
})
const payment=mongoose.model("payment",Paymentschema);
export default payment;