const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../model/user');
require('dotenv').config();

const createTestUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');

        // Create a test user with a known password
        const testUser = {
            email: 'test@school.com',
            password: 'test123',
            role: 'admin'
        };

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(testUser.password, salt);

        // Delete existing test user if exists
        await User.deleteOne({ email: testUser.email });

        // Create new test user
        await User.create({
            email: testUser.email,
            password: hashedPassword,
            role: testUser.role
        });

        console.log('\n✅ Test user created successfully!');
        console.log('\nYou can now login with these credentials:');
        console.log('----------------------------------------');
        console.log('Email:', testUser.email);
        console.log('Password:', testUser.password);
        console.log('Role:', testUser.role);

        mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error);
    }
};

createTestUser(); 