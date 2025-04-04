const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../model/user');
require('dotenv').config();

const createTestStudent = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');

        // Create a test student with a simple password
        const testStudent = {
            email: 'student@school.com',
            password: 'student123',
            role: 'student'
        };

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(testStudent.password, salt);

        // Delete existing test student if exists
        await User.deleteOne({ email: testStudent.email });

        // Create new test student
        await User.create({
            email: testStudent.email,
            password: hashedPassword,
            role: testStudent.role
        });

        console.log('\n✅ Test student created successfully!');
        console.log('\nYou can now login with these credentials:');
        console.log('----------------------------------------');
        console.log('Email:', testStudent.email);
        console.log('Password:', testStudent.password);
        console.log('Role: student');

        mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error);
    }
};

createTestStudent(); 