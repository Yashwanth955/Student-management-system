const User = require("../model/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        const user = await User.findOne({ email, role });
        if (!user) return res.status(400).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid password" });

        const token = jwt.sign({ id: user._id, role: user.role }, "your_secret_key", { expiresIn: "1h" });

        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};
