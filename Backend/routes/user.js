  import express from "express";
  import bcrypt from "bcrypt";
  import User from "../Models/User.js";
  import jwt from "jsonwebtoken";
  import dotenv from "dotenv";
  import verifyToken from "../Middleware/jwt.js";

  dotenv.config();
  const Router=express.Router();

  // Router.post("/register", async (req, res) => {
  //     try {
  //       console.log("Received request:", req.body);

  //       const { username, password } = req.body;
  //       if (!username || !password) {
  //         return res.status(400).json({ success: false, message: "Username and password are required" });
  //       }
        
  //       const existing = await User.findOne({ username });
  //       if (existing) {
  //         return res.status(400).json({ success: false, message: "User already exists" });
  //       }
    
  //       const hashed = await bcrypt.hash(password, 10);
  //       const newUser = new User({ username, password: hashed });
  //       await newUser.save();
    
  //       return res.status(201).json({ success: true, message: "Registered successfully" });
  //     } catch (err) {
  //       console.error("❌ Register Error:", err);
  //       return res.status(500).json({ success: false, message: "Server issue", error: err.message });
  //     }
  //   });
    

  
Router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: "User and password are required" });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid user" });
    }

      const decodedHashBuffer = Buffer.from(user.password, 'base64');

    // Compare the password with the decoded bcrypt hash
    const isMatch = await bcrypt.compare(password, decodedHashBuffer.toString('utf-8'));
      if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({ success: true, message: "Success", token, user });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server issue", err });
  }
});
Router.get("/profile-image",verifyToken, async (req, res) => {
  try {
    // Fetch user details by ID, excluding the password
    const user = await User.findById({ _id: req.userId }).select("-password");

    if (!user) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    // Include the profile image if it exists, and add the username
    const userProfile = {
      username: user.username,
      shopname:user.shopname,
      address:user.address,
      profile_image: user.profile_image
        ? `data:${user.profile_image.contentType};base64,${user.profile_image.data.toString("base64")}`
        : null
    };
    

    return res.status(200).json({ success: true, message: "Success", user: userProfile });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server issue", error: err.message });
  }
});
  Router.put("/update_password",async (req, res) => {
    try {
      const { phonenumber, newPassword } = req.body;
  
      if (!phonenumber || !newPassword) {
        return res.status(400).json({ success: false, message: "Phone number and new password are required" });
      }
  
      const user = await User.findOne({ phonenumber });
  
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const base64Hash = Buffer.from(hashedPassword).toString("base64");
  
      user.password = base64Hash;
      await user.save();
  
      res.status(200).json({ success: true, message: "Password updated successfully" });
    } catch (error) {
      console.error("Error updating password:", error);
      res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  });
  
  Router.put("/profile-image", verifyToken, async (req, res) => {
    try {
      const { profile_img } = req.body;
      if (!profile_img) {
        return res.status(400).json({ success: false, message: "Profile image is required" });
      }
  
      const user = await User.findOne({ _id: req.userId });
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      // Example base64 format: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
      const matches = profile_img.match(/^data:(.+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ success: false, message: "Invalid image format" });
      }  
      const contentType = matches[1]; // image/png or image/jpeg
      const base64Data = matches[2];
      const imageData = Buffer.from(base64Data, "base64");
  
      // Save profile image
      user.profile_image = {
        data: imageData,
        contentType: contentType,
      };
    
      await user.save();
  
      return res.status(200).json({ success: true, message: "Profile image updated successfully" });
    } catch (err) {
      console.error("Profile image update error:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });
  Router.post("/logout",verifyToken,async(req,res)=>{
    res.status(200).json({success:true,message:"logout"})
  })


Router.put("/shop", verifyToken, async (req, res) => {
  try {
    const { shopname, shopaddress, shopdetails } = req.body;

    // Validate inputs
    if (!shopname || !shopaddress) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields (shop name and address)",
      });
    }

    // Find the user
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user fields
    user.shopName = shopname;
    user.shopAddress = shopaddress;
    if (shopdetails) user.shopDetails = shopdetails;

    // Save updated user
    await user.save();

    // Respond success
    res.status(200).json({
      success: true,
      message: "Shop details updated successfully",
      updatedShop: {
        shopName: user.shopName,
        shopAddress: user.shopAddress,
        shopDetails: user.shopDetails,
      },
    });
  } catch (error) {
    console.error("Error updating shop:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating shop details",
    });
  }
});

    // Router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

  // Router.get(
  //     "/google/callback",
  //     passport.authenticate("google", {
  //         successRedirect: "/user/success",
  //         failureRedirect: "/user/failure",
  //     })
  // );

  // Router.get("/success", (req, res) => {
  //     if (!req.user) {
  //         return res.status(401).json({ success: false, message: "Not authenticated" });
  //     }
  //     res.status(200).json({ success: true, message: "Login successful", user: req.user });
  // });

  // Router.get("/failure", (req, res) => {
  //     res.status(401).json({ success: false, message: "Authentication failed" });
  // });

  export default Router;
