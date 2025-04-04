const mongoose = require('mongoose');
const User = require('../model/user');
const users = require('../data/users.json');
require('dotenv').config();

const importUsers = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');

        // Delete existing users
        await User.deleteMany({});
        console.log('🗑️ Cleared existing users');

        // Import users from JSON
        await User.insertMany(users);
        console.log('✅ Users imported successfully!');

        console.log('\nYou can now login with these credentials:');
        console.log('----------------------------------------');
        users.forEach(user => {
            console.log(`\n${user.role.toUpperCase()}:`);
            console.log(`Email: ${user.email}`);
            console.log(`Password: password123`); // All users have the same password for simplicity
        });

        mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

importUsers(); 