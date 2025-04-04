const mongoose = require('mongoose');
const User = require('../model/user');
require('dotenv').config();

const checkUsers = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');

        // Find all users
        const users = await User.find({});
        console.log('\n📋 Users in database:', users.length);
        
        if (users.length === 0) {
            console.log('❌ No users found in database!');
        } else {
            users.forEach(user => {
                console.log('\n👤 User:', {
                    email: user.email,
                    role: user.role,
                    passwordHash: user.password.substring(0, 20) + '...' // Show part of password hash
                });
            });
        }

        mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error);
    }
};

checkUsers(); 