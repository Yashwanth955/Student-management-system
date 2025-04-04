const mongoose = require('mongoose');
const User = require('../model/user');
require('dotenv').config();

const listUsers = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/school_management', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');

        // Find all users
        const users = await User.find({}, 'email role');
        
        console.log('\n🧑‍🤝‍🧑 User Accounts in the System');
        console.log('----------------------------------------');
        
        if (users.length === 0) {
            console.log('No users found in the database.');
        } else {
            console.log(`Total users: ${users.length}\n`);
            
            // Group users by role
            const usersByRole = {};
            users.forEach(user => {
                if (!usersByRole[user.role]) {
                    usersByRole[user.role] = [];
                }
                usersByRole[user.role].push(user.email);
            });
            
            // Print users by role
            for (const role in usersByRole) {
                console.log(`${role.toUpperCase()} ACCOUNTS (${usersByRole[role].length}):`);
                usersByRole[role].forEach(email => {
                    console.log(`- ${email}`);
                });
                console.log(''); // Empty line between roles
            }
            
            console.log('Note: To reset a password, use the resetPassword.js script.');
            console.log('Example: node resetPassword.js user@example.com newpassword');
        }
        
        mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

listUsers(); 