import express from "express"
import verifyToken from "../Middleware/jwt.js";
import User from "../Models/User.js";
import payment from "../Models/Payment.js";
import Productsc from "../Models/Products.js";

const pay=express.Router();
pay.post("/payment",verifyToken,async(req,res)=>{
try{
const{username,productname,price,quantity}=req.body;
const user=await User.findOne({_id:req.userId})
if(!user){
    return res.status(400).json({success:false,message:"Invalid user"});
}
if(!username || !productname || !price || !quantity){
    return res.status(400).json({success:false,message:"All fields are required"});
}
const product=await Productsc.findOne({productname:productname});
if(!product){
    return res.status(400).json({success:false,message:"Product not fount"}); 
}
if(product.stock<quantity){
    return res.status(400).json({success:false,message:"Insufficent products"}); 
}
if(product.stock===0){

}
product.stock-=quantity;
product.salesCount+=quantity;
const salesHistory = [];
const currentDate = new Date();

for (let i = 0; i < 30; i++) {
  const saleDate = new Date(currentDate);
  saleDate.setDate(saleDate.getDate() - i); // Set date to previous days
  const saleCount = Math.floor(Math.random() * 10); // Random sales count between 0 and 9

  salesHistory.push({
    date: saleDate.toISOString(), // Date in ISO format
    count: saleCount,
  });
}
product.salesHistory = [...product.salesHistory, ...salesHistory];
await product.save();
const newPayment=new payment({
    userId:user._id,
    username,
    productname,
    price,
    quantity,

    total:price*quantity,

    date:new Date()
})
await newPayment.save();

 return res.status(200).json({success:true,message:"Sucucess"});
}catch(err){
    console.error("error ",err);
    return res.status(500).json({success:false,message:"Internal error "})
}
})

pay.get("/payment/:username",verifyToken,async(req,res)=>{
    try{
    const user=await User.findOne({_id:req.userId});
    const {username}=req.params;
    if(!user){
        return res.status(400).json({success:false,message:"Invalid user"});
    }
    
    const paymentsof=await payment.find({userId:req.userId,username:username});
    if(!paymentsof){
        return res.status(400).json({success:false,message:"not found"});
    }
//     const paymentsof=payments.map((users)=>({
//     userId:users.userId,
//     username:users.username,
//     productname:users.productname,
//     price:users.price,
//     quantity:users.quantity,
//     total:users.total
// }))
return res.status(200).json({success:true,message:"Sucucess",paymentsof});
} catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
}

})
export default pay;
