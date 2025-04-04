const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../model/user');
require('dotenv').config();

// Get email and new password from command line arguments
const email = process.argv[2];
const newPassword = process.argv[3] || 'password123'; // Default password if not provided

if (!email) {
    console.error('❌ Error: Email is required');
    console.log('Usage: node resetPassword.js <email> [newPassword]');
    process.exit(1);
}

const resetPassword = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/school_management', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');

        // Find the user
        const user = await User.findOne({ email });
        if (!user) {
            console.error(`❌ Error: User with email ${email} not found`);
            process.exit(1);
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update the user's password
        await User.updateOne({ email }, { $set: { password: hashedPassword } });
        
        console.log(`✅ Password reset successfully for ${email}`);
        console.log(`New password: ${newPassword}`);
        
        mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

resetPassword(); 