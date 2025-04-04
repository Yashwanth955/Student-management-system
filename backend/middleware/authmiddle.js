const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "Access Denied" });

    try {
        // Extract the token if it's in Bearer format
        const tokenValue = token.startsWith("Bearer ") ? token.slice(7) : token;
        const verified = jwt.verify(tokenValue, process.env.JWT_SECRET || "your_secret_key");
        req.user = verified;
        next();
    } catch (error) {
        console.error("❌ Token verification error:", error.message);
        res.status(401).json({ message: "Invalid Token" });
    }
};
