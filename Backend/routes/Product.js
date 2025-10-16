import express from "express"
import Productsc from"../Models/Products.js"
import User from "../Models/User.js";
import verifyToken from "../Middleware/jwt.js";
import mongoose from "mongoose";
const prod=express.Router();


prod.post("/add",verifyToken,async(req,res)=>{
    try{
    const{productname,price,product_img,description,category,stock}=req.body;
    const user=await User.findOne({_id:req.userId})
    
    if(!user){
        return res.status(400).json({success:false,message:"Invalid user"});
    }
    if (!product_img) {
        console.log("🚨 Image missing from request body!");
        return res.status(400).json({ success: false, message: "Image is required" });
      }
      
    
  const existpro=await Productsc.findOne({user_id:req.userId,productname:productname});
  if(existpro){
  return res.status(400).json({ success: false, message: "product exits" });
}

    const imageData = Buffer.from(product_img, "base64");

    const newprod=new Productsc({
        user_id:user._id,
        productname,
        price,
        product_img:{
            data: imageData,
            contentType: "image/png",
        },
        description,
        category,
        stock,
        salesHistory: [],
    })
    await newprod.save();
    return res.status(200).json({success:true ,message:"inserted successfully"})
    }
    catch(err){
        console.error("error message",err);
        return res.status(500).json({success:false, message:"server issue"})
    }
})

prod.get("/category/:category",verifyToken,async(req,res)=>{
    try{
    const{category}=req.params;
    const user=await User.findOne({_id:req.userId});
    if(!user){
        return res.status(400).json({success:false,message:"Invalid user"})
    }
const product = await Productsc.find({
  user_id: req.userId,
  category: category
});
    if(!product || product.length===0){
        return res.status(400).json({success:false,message:"not found"});
    }
    const cat = product.map((product) => ({
        id:product._id,
        productname: product.productname,
        price: product.price,
        description: product.description,
        category: product.category,
        stock: product.stock,

        product_img: product.product_img
            ? `data:${product.product_img.contentType};base64,${product.product_img.data.toString("base64")}`
            : null
    }));

    return res.status(200).json({ success: true, message: "success", cat });
  
    
}catch(err){
    console.error("Error ",err);
    return res.status(500).json({success:false,message:"internal"});
}
})
prod.get("/:productname",verifyToken,async(req,res)=>{
    try{
    const{productname}=req.params;
    const user=await User.findOne({_id:req.userId});
    if(!user){
        return res.status(400).json({success:false,message:"Invalid user"})
    }
    const product= await Productsc.find({user_id:req.userId,productname:productname});
    if(!product || product.length===0){
        return res.status(400).json({success:false,message:"not found"});
    }
    const cat = product.map((product) => ({
        id:product._id,
        productname: product.productname,
        price: product.price,
        description: product.description,
        category: product.category,
        stock: product.stock,

        product_img: product.product_img
            ? `data:${product.product_img.contentType};base64,${product.product_img.data.toString("base64")}`
            : null
    }));
    
    return res.status(200).json({ success: true, message: "success", cat });
   
}catch(err){
    console.error("Error ",err);
    return res.status(500).json({success:false,message:"internal"});
}
});


prod.put("/:productname", verifyToken, async (req, res) => {
  try {
    const { productname } = req.params;
    const { stock } = req.body;

    const user = await User.findOne({ _id: req.userId });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid user" });
    }

    // Find product before update (to compare stock difference)
    const existingProduct = await Productsc.findOne({
      user_id: req.userId,
      productname: productname,
    });

    if (!existingProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Compare old and new stock
    const oldStock = existingProduct.stock;
    const newStock = Number(stock);

    let stockChange = newStock - oldStock;
    let updatedFields = { $set: { stock: newStock } };

    // ✅ Only count as sale when stock decreases
    if (stockChange < 0) {
      const saleCount = Math.abs(stockChange);
      updatedFields.$inc = { salesCount: saleCount };

      // Add to sales history
      updatedFields.$push = {
        salesHistory: {
          date: new Date(),
          count: saleCount,
        },
      };
    }

    // Update product
    const product = await Productsc.findOneAndUpdate(
      { user_id: req.userId, productname },
      updatedFields,
      { new: true }
    );

    if (!product) {
      return res.status(400).json({ success: false, message: "Update failed" });
    }

    const cat = {
      id: product._id,
      productname: product.productname,
      price: product.price,
      description: product.description,
      category: product.category,
      stock: product.stock,
      product_img: product.product_img
        ? `data:${product.product_img.contentType};base64,${product.product_img.data.toString("base64")}`
        : null,
    };

    return res.status(200).json({ success: true, message: "Stock updated", cat });
  } catch (err) {
    console.error("Error updating stock:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});



prod.get("/pro/outofstock", verifyToken, async (req, res) => {
    try {
               const userlogin = await User.findOne({ _id: req.userId });
 // Check if user is found
        
        if (!userlogin) {
            return res.status(400).json({ success: false, message: "Invalid user" });
        }

        const outOfStockProducts = await Productsc.find({ user_id: req.userId, stock: 0 });
       // Check the retrieved products

        if (outOfStockProducts.length === 0) {
            return res.status(200).json({ success: true, message: "No out-of-stock products", products: [] });
        }

        const out = outOfStockProducts.map((product) => ({
            id: product._id,
            productname: product.productname,
            price: product.price,
            description: product.description,
            category: product.category,
            stock: product.stock,
            product_img: product.product_img
                ? `data:${product.product_img.contentType};base64,${product.product_img.data.toString("base64")}`
                : null
        })); // Check the final array
        return res.status(200).json({ success: true, message: "success", out });
    } catch (error) {
        console.log("Error in fetching out-of-stock products:", error.message);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
});

prod.delete("/delete/:productname", verifyToken, async (req, res) => {
    try {
        const userlogin = await User.findOne({ _id: req.userId });
        if (!userlogin) {
            return res.status(400).json({ success: false, message: "Invalid user" });
        }
        const {productname}=req.params;
        if(!productname){
            return res.status(400).json({ success: false, message: "No product found" }); 
        }
        const deletedProduct = await Productsc.findOneAndDelete({ user_id: req.userId, productname });

        return res.status(200).json({ success: true, message: "Product deleted successfully", deletedProduct });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
});
prod.get("/pro/top-selling", verifyToken, async (req, res) => {
    try {
        const userId = req.userId; // Extract user ID from token

        const top = await Productsc.find({ user_id: userId })
            .sort({ salesCount: -1 }).limit(5); // Sort in descending order by salesCount     
        const topProducts = top.map((product) => ({
            id: product._id,
            productname: product.productname,
            price: product.price,
            description: product.description,
            category: product.category,
            stock: product.stock,
             salesCount: product.salesCount, 
            product_img: product.product_img
             
                ? `data:${product.product_img.contentType};base64,${product.product_img.data.toString("base64")}`
                : null
            
        }));
   
        return res.status(200).json({ success: true, topProducts});
    } catch (error) {
        console.error("Error fetching top-selling products:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch data" });
    }
});
// API to fetch sales history data
prod.get("/sales/:productname/:timePeriod", verifyToken, async (req, res) => {
    try {
      const { productname } = req.params;
      const { timePeriod } = req.params; // week, month, year
  
      const product = await Productsc.findOne({ productname: productname });
  
      if (!product) {
        return res.status(400).json({ success: false, message: "Product not found" });
      }
  
      // Filter salesHistory based on the time period
      let filteredSales = product.salesHistory;
  
      // Filter by week
      if (timePeriod === 'week') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7); // 7 days ago
        filteredSales = filteredSales.filter(sale => new Date(sale.date) >= oneWeekAgo);
      }
      
      // Filter by month
      if (timePeriod === 'month') {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1); // 1 month ago
        filteredSales = filteredSales.filter(sale => new Date(sale.date) >= oneMonthAgo);
      }
  
      // Filter by year
      if (timePeriod === 'year') {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1); // 1 year ago
        filteredSales = filteredSales.filter(sale => new Date(sale.date) >= oneYearAgo);
      }
  
      return res.status(200).json({ success: true, data: filteredSales });
    } catch (err) {
      console.error("Error fetching sales data:", err);
      return res.status(500).json({ success: false, message: "Server issue" });
    }
  });
  
export default prod;
