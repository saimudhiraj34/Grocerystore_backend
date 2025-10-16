import mongoose from "mongoose"; 
const userschema=new mongoose.Schema({
    username:{type:String,required:true},
    password:{type:String,required:true},
    phonenumber:{type:String,required:true,unique:true},
    faceData: { type: Array, default: [] },
    profile_image: {
        data: Buffer,             // Binary image data
        contentType: String       // MIME type (e.g., image/jpeg, image/png)
    },
    shopname:{type:String}, 
    address:{type:String},
    shopdetails:{type:String}
})
const User=mongoose.model("User",userschema);
export default User;