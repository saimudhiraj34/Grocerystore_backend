import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import session from "express-session";
import Router from "./routes/user.js";
import router from "./routes/credit.js";
import creditd from "./routes/creditdetail.js";
import prod from "./routes/Product.js";
import pay from "./routes/payment.js";
import paid from "./routes/payed.js";



dotenv.config();
const app = express();
const port = 3000;


const allowedOrigins = process.env.FRONTEND


app.use(
  cors({
    origin:allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type","Authorization"],
    credentials: true,
  })
);

app.use(express.json({ limit: "70mb" })); // Increase limit to 10MB
app.use(express.urlencoded({ extended: true, limit: "70mb" }));


mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
  })
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

app.use("/user", Router);
app.use("/credit",router)
app.use("/creditd",creditd);
app.use("/prod",prod);
app.use("/pay",pay);
app.use("/hist",paid);


app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
// mongodb://localhost:27017/
// mongodb://localhost:27017/