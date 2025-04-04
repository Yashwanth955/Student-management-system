const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../model/user');
require('dotenv').config();

const defaultUsers = [
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

const createDefaultUsers = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/school_management', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');

        console.log('Creating default users...');
        
        // Create each default user if they don't exist
        for (const userData of defaultUsers) {
            // Check if user already exists
            const existingUser = await User.findOne({ email: userData.email });
            
            if (existingUser) {
                console.log(`User ${userData.email} already exists - skipping`);
                continue;
            }
            
            // Hash the password
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            
            // Create the user
            await User.create({
                email: userData.email,
                password: hashedPassword,
                role: userData.role
            });
            
            console.log(`✅ Created ${userData.role}: ${userData.email}`);
        }

        console.log('\n🎉 Default user setup complete!');
        console.log('\nYou can now login with these credentials:');
        console.log('----------------------------------------');
        
        defaultUsers.forEach(user => {
            console.log(`\n${user.role.toUpperCase()}:`);
            console.log(`Email: ${user.email}`);
            console.log(`Password: ${user.password}`);
        });

        mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

createDefaultUsers(); 