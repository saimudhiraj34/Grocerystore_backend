import mongoose, { Schema } from "mongoose";

const productsschema=new mongoose.Schema({
    user_id:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
    productname:{type:String,required:true},
    price:{type:Number,required:true},
    product_img:{data:Buffer,contentType:String},
    description:{type:String,required:true},
    category:{type:String,required:true},
    stock:{type:Number,required:true},
    salesCount: { type: Number, default: 0 }, 
    salesHistory: [
        {
          date: { type: Date, required: true },
          count: { type: Number, default: 0 }
        }
      ]
})
const Productsc=mongoose.model("Productsc",productsschema)
export default Productsc;