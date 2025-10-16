import mongoose from "mongoose";

const payedSchema=new mongoose.Schema({
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
        username:{type:String},
        phonenumber:{type:Number,required:true,ref:"Credit"},
        products:{type:String,required:true},
        prices:{type:Number,required:true},
        Date:{type:Date,required:true}
})
const payed=mongoose.model("payed",payedSchema);
export  default payed;