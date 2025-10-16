// In your middleware file (e.g., verifyToken.js)
import jwt from 'jsonwebtoken';
import User from "../Models/User.js";

const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(403).json({ message: "Access denied. No valid token provided." });
    }
    const token = authHeader.split(" ")[1]; 
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            console.error("Token Error:", err);
            return res.status(401).json({ message: "Invalid or expired token" });
        }
        try {
            const user = await User.findById(decoded.id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }      
            req.userId = user._id;
            req.username = user.username;
            next();
        } catch (error) {
            return res.status(500).json({ message: "Error verifying user", error: error.message });
        }
    });
};

export default verifyToken; 