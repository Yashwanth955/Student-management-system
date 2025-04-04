const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../model/user');
require('dotenv').config();

const dummyUsers = [
    {
        email: 'admin@school.com',
        password: 'admin123',
        role: 'admin'
    },
    {
        email: 'teacher@school.com',
        password: 'teacher123',
        role: 'teacher'
    },
    {
        email: 'student@school.com',
        password: 'student123',
        role: 'student'
    }
];

const createDummyUsers = async () => {
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

        // Create new users with hashed passwords
        for (const user of dummyUsers) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            await User.create({
                email: user.email,
                password: hashedPassword,
                role: user.role
            });
            console.log(`✅ Created ${user.role} user: ${user.email}`);
        }

        console.log('\n🎉 Dummy users created successfully!');
        console.log('\nYou can now login with these credentials:');
        console.log('----------------------------------------');
        dummyUsers.forEach(user => {
            console.log(`\n${user.role.toUpperCase()}:`);
            console.log(`Email: ${user.email}`);
            console.log(`Password: ${user.password}`);
        });

        mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error);
    }
};

createDummyUsers(); 