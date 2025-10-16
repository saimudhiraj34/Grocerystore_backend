import mongoose from "mongoose";


const Creditdetailschema=new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
    username:{type:String},
    phonenumber:{type:Number,required:true,ref:"Credit"},
    products:{type:String,required:true},
    prices:{type:Number,required:true},
    Date:{type:Date,required:true}
})
const Creditdetails=mongoose.model("Creditdetails",Creditdetailschema)
export default Creditdetails;