import express from  "express";
import User from "../Models/User.js";
import Credit from "../Models/Credit.js";
import verifyToken from "../Middleware/jwt.js"
import { createSearchParams } from "react-router-dom";
const router=express.Router();
router.post("/register",verifyToken,async(req,res)=>{
    try{
    const{username,phonenumber,image}=req.body;
    if(!username || !phonenumber || !image){
        return res.status(400).json({success:false,message:"all the fields are required"});
    }
    const exist=await Credit.findOne({user_id:req.userId,phonenumber});
    if(exist){
        return res.status(400).json({success:false,message:"User exist"});
    }
    const existname=await Credit.findOne({user_id:req.userId,username});
    if(existname){
        return res.status(400).json({success:false,message:"use different username"});
    }
    const imageData = Buffer.from(image, "base64");

    const newUser = new Credit({
        user_id:req.userId,
        username,
        phonenumber,
        image: {
            data: imageData,
            contentType: "image/png", 
        },
    });

    await newUser.save();
    return res.status(200).json({success:true,message:"register successfully"});
}
catch(err){
    console.error("error",err);
    return res.status(500).json({success:true,message:"server issue"});
}
})


router.get("/users",verifyToken, async (req, res) => {

    try {
        const users = await Credit.find({user_id: req.userId});
        const formattedUsers = users.map(user => {
// Debugging Step
            return {
                username: user.username,
                phonenumber: user.phonenumber,
                image: user.image 
                    ? `data:${user.image.contentType};base64,${user.image.data.toString("base64")}` 
                    : null
            };
        });


        res.status(200).json({ success: true, message: "success", users: formattedUsers });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ success: false, message: "Failed to retrieve users" });
    }
});
router.delete("/delete/:phonenumber", verifyToken, async (req, res) => {
    try {
        console.log("Received DELETE request for creditid:", req.params.phonenumber);
        console.log("User ID from token:", req.userId);

        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Unauthorized: Missing userId" });
        }
        const userlogin = await User.findOne({ _id: req.userId });
        if (!userlogin) {
            return res.status(400).json({ success: false, message: "Invalid user" });
        }

        const { phonenumber } = req.params;
        if (!phonenumber) {
            return res.status(400).json({ success: false, message: "No credit ID provided" });
        }

        console.log("Attempting to delete with:", { user_id: req.userId,phonenumber });

        const deletedUser = await Credit.findOneAndDelete({ 
            user_id: req.userId, 
            phonenumber:phonenumber
        });

        if (!deletedUser) {
            return res.status(404).json({ success: false, message: "Credit entry not found" });
        }

        console.log("Deleted user:", deletedUser);
        return res.status(200).json({ success: true, message: "Deleted successfully", deletedUser });

    } catch (error) {
        console.error("Error deleting user:", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
});


router.get("/check/:phonenumber", verifyToken, async (req, res) => {
  try {
    const { phonenumber } = req.params;
    const creditUser = await Credit.findOne({user_id:req.userId,phonenumber});

    if (creditUser) {
      return res.status(200).json({ exists: true });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (err) {
    console.error("Error checking credit user:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});


export default  router;