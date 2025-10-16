    import mongoose, { mongo } from "mongoose";

    const creditschema=new mongoose.Schema({
        user_id:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
        username:{type:String,required:true},
        phonenumber:{type:Number,reqired:true},
        image:{data: Buffer, contentType: String} 
    })
    const Credit=mongoose.model("Credit",creditschema);
    export default Credit;