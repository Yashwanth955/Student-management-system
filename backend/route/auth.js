const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/user");
require("dotenv").config();

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered." });
        }

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save new user
        const newUser = new User({ name, email, password: hashedPassword, role });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        console.error("Registration Error:", error); // Log error to the server
        res.status(500).json({ message: "Server error, please try again." });
    }
});

router.post("/login", async (req, res) => {
    const { email, password, role } = req.body;

    try {
        console.log("⏱️ Login attempt started at:", new Date().toISOString());
        console.log("📝 Login credentials received:", { email, role, passwordProvided: !!password });
        
        // Validate input
        if (!email || !password || !role) {
            console.log("❌ Missing required fields");
            return res.status(400).json({ 
                success: false, 
                message: "Email, password, and role are required" 
            });
        }

        // Find user by email and role
        console.log("🔍 Searching for user with email and role:", email, role);
        const user = await User.findOne({ email, role });
        
        if (!user) {
            console.log("❌ User not found with email and role combination");
            return res.status(401).json({ 
                success: false, 
                message: "Invalid credentials" 
            });
        }

        console.log("✅ User found in database:", user._id.toString());

        // Compare password
        console.log("🔐 Comparing password hashes...");
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            console.log("❌ Password does not match");
            return res.status(401).json({ 
                success: false, 
                message: "Invalid credentials" 
            });
        }

        console.log("✅ Password matches");
        
        // Generate JWT token
        console.log("🔑 Generating JWT token with secret:", process.env.JWT_SECRET ? "SECRET EXISTS" : "NO SECRET AVAILABLE");
        try {
            const token = jwt.sign(
                { 
                    id: user._id, 
                    email: user.email, 
                    role: user.role 
                }, 
                process.env.JWT_SECRET || "your_secret_key", 
                { 
                    expiresIn: "24h" 
                }
            );
            
            console.log("✅ Token generated successfully");
            console.log("✅ Login successful for:", email);

            return res.json({
                success: true,
                token: token,
                role: user.role,
                email: user.email
            });
        } catch (tokenError) {
            console.error("❌ Error generating token:", tokenError);
            return res.status(500).json({ 
                success: false, 
                message: "Error generating authentication token" 
            });
        }
    } catch (error) {
        console.error("❌ Server error during login:", error);
        console.error("❌ Error stack:", error.stack);
        return res.status(500).json({ 
            success: false, 
            message: "Server error during login. Please check server logs." 
        });
    }
});

module.exports = router;
