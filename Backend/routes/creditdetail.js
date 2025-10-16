import express, { json } from "express";
import Creditdetails from "../Models/Creditdetail.js";
import User from "../Models/User.js"; // Assuming your user model is named 'User'
import verifyToken from "../Middleware/jwt.js";
import Credit from "../Models/Credit.js";
import { FaAws } from "react-icons/fa";



const creditd = express.Router();

// ✅ Route to Add Credit Details (Using userId Instead of username)
creditd.post("/add/:phonenumber", verifyToken, async (req, res) => {
    try {
        const { products, prices } = req.body;
        const {phonenumber}=req.params;
        console.log(products,prices,phonenumber);

        // Use req.userId to find the user instead of using username from the URL
        const user = await User.findOne({_id:req.userId}); // Use req.userId directly

        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }
        if (!products || !prices) {
            return res.status(400).json({ success: false, message: "Invalid input" });
        }
         const credituser= await Credit.findOne({user_id:user._id, phonenumber: phonenumber });
         if(!credituser){
            return res.status(400),json({success:false,message:"invalid"});
         }
        const newCredit = new Creditdetails({
            userId: user._id, 
            phonenumber:phonenumber, 
            products,
            prices,
            Date: new Date(),
        });

        await newCredit.save();
        return res.status(200).json({ success: true, message: "Credit details added successfully!" });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error });
    }
});

creditd.get("/:phonenumber", verifyToken, async (req, res) => {
    try {
        const {phonenumber} = req.params;
        console.log("Fetching credit details for username:",phonenumber);

        // 🛠️ Verify the logged-in user
        const loggedInUser = await User.findById(req.userId);
        if (!loggedInUser) {
            console.log("Invalid logged-in user:", req.userId);
            return res.status(403).json({ success: false, message: "Unauthorized access" });
        }

        // 🛠️ Find the credit user using the provided username
        const creditUser = await Credit.findOne({phonenumber});
        if (!creditUser) {
            console.log("Credit user not found for username:",phonenumber);
            return res.status(404).json({ success: false, message: "Credit user not found" });
        }
               // 🛠️ Fetch credit details that match the logged-in user and the credit user
        const userCredits = await Creditdetails.find({ userId: req.userId, phonenumber:phonenumber});

        if (!userCredits.length) {
            console.log("No credit details found for user:", req.userId);
            return res.status(404).json({ success: false, message: "No credit details found" });
        }

        return res.status(200).json({ success: true, data: userCredits });
    } catch (error) {
        console.error("Error in /:username route:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
});

creditd.delete("/delete/:id", verifyToken, async (req, res) => {
    try {
      const loggedInUser = await User.findById(req.userId);
      const { id } = req.params;
  
      if (!loggedInUser) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      if (!id) {
        return res.status(400).json({ success: false, message: "ID not provided" });
      }
  
      const deletedUser = await Creditdetails.findOneAndDelete({
        _id: id,
        userId: req.userId, // match user to ensure safety
      });
  
      if (!deletedUser) {
        return res.status(404).json({ success: false, message: "Credit entry not found" });
      }
  
      console.log("Deleted credit entry:", deletedUser);
      return res.status(200).json({ success: true, message: "Deleted successfully", deletedUser });
    } catch (error) {
      console.error("Error deleting credit:", error);
      return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
  });
  
creditd.delete("/delete/details/:phonenumber",verifyToken,async(req,res)=>{
  try{
 const loggedInUser=await User.findOne(req.userId);
 if(!loggedInUser){
  return res.status(400).json({success:false,message:"unauthorized user"});
 }
 const{phonenumber}=req.params;
 if(!phonenumber){
  return res.status(400).json({success:false,message:"phone number not found"});
 }
 const result = await Creditdetails.deleteMany({userId:req.userId,phonenumber: phonenumber });
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

creditd.post("/addmany/:phonenumber", verifyToken, async (req, res) => {
  try {
    const { phonenumber } = req.params;
    const { products } = req.body;
     const userId = req.userId;

    // 1️⃣ Check if credit user exists
     const loggedInUser=await User.findOne(req.userId);
 if(!loggedInUser){
  return res.status(400).json({success:false,message:"unauthorized user"});
 }
     // 2️⃣ Add each product to CreditDetail collection
    const creditEntries = products.map((p) => ({
      userId,
     username:p.username,
      phonenumber,
      products: p.productName,
      prices: p.price, 
      Date: new Date(p.id), // since your frontend sends id as Date.now()
    }));

    await Creditdetails.insertMany(creditEntries);

    return res.status(200).json({
      success: true,
      message: "Products added to credit user successfully.",
    });
  } catch (err) {
    console.error("Error adding to credit user:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});



export default creditd;

