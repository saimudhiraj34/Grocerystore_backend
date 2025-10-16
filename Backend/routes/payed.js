
import express from "express";
import User from "../Models/User.js";
import Credit from "../Models/Credit.js";
import verifyToken from "../Middleware/jwt.js";
import payed from "../Models/Payed.js";


const paid=express.Router()
paid.post("/add/:phonenumber",verifyToken,async(req,res)=>{
           try {
            const {phonenumber}=req.params;
            const { products, prices } = req.body;
           console.log(products,prices);
            console.log(phonenumber);
    
            // Use req.userId to find the user instead of using username from the URL
            const user = await User.findOne({_id:req.userId}); // Use req.userId directly
    
            if (!user) {
                return res.status(400).json({ success: false, message: "User not found" });
            }
            if (!phonenumber) {
                return res.status(400).json({ success: false, message: "Invalid input" });
            }
             const credituser= await Credit.findOne({user_id:user._id, phonenumber: phonenumber });
             if(!credituser){
                return res.status(400).json({success:false,message:"invalid"});
             }
             const payedEntry = new payed({
                userId: user._id, 
                phonenumber:phonenumber, 
                products,
                prices,
                Date: new Date(),
            });
    
            try {
                await payedEntry.save();
                return res.status(200).json({ success: true, message: "Credit details added successfully!" });
            } catch (saveError) {
                console.error("Save failed:", saveError);
                return res.status(500).json({ success: false, message: "Failed to save payed entry", error: saveError });
            }
        }
        catch(err){
            console.error("error ",err)
        }
            
    });

    paid.get("/get/:phonenumber", verifyToken, async (req, res) => {
        try {
          const { phonenumber } = req.params;
          const userId = req.userId; // from token
      
          const history = await payed.find({ phonenumber, userId });
      
          if (!history || history.length === 0) {
            return res.status(404).json({ success: false, message: "No history found" });
          }
      
          return res.status(200).json({ success: true, data: history });
      
        } catch (error) {
          console.error("Error fetching history:", error);
          return res.status(500).json({ success: false, message: "Server error", error });
        }
      });

      paid.delete("/delete/:phonenumber",verifyToken,async(req,res)=>{
        try{
       const loggedInUser=await User.findOne(req.userId);
       if(!loggedInUser){
        return res.status(400).json({success:false,message:"unauthorized user"});
       }
       const{phonenumber}=req.params;
       if(!phonenumber){
        return res.status(400).json({success:false,message:"phone number not found"});
       }
       const result = await payed.deleteMany({userId:req.userId,phonenumber: phonenumber });
       if (!result) {
        return res.status(404).json({ success: false, message: "Credit entry not found" });
      }
       return res.status(200).json({ success: true, message: "All user details deleted successfully" });
      
       }
       catch (err) {
        console.error("Error deleting details:", err);
        return res.status(500).json({ success: false, message: "Server error while deleting user details" });
      }
      }
      )
      
export default paid;