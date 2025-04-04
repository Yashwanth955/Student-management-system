const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const adminData = {
    email: 'admin@school.com',
    password: 'admin123',
    role: 'admin',
    name: 'System Administrator'
};

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(async () => {
    console.log('✅ MongoDB Connected');
    
    try {
        // Delete existing admin user if exists
        await mongoose.connection.db.collection('users').deleteOne({ email: adminData.email });
        
        // Create new admin user with hashed password
        const hashedPassword = await bcrypt.hash(adminData.password, 10);
        await mongoose.connection.db.collection('users').insertOne({
            ...adminData,
            password: hashedPassword
        });
        
        console.log('✅ Admin user created successfully');
        console.log('Email:', adminData.email);
        console.log('Password:', adminData.password);
        console.log('Role:', adminData.role);

    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await mongoose.connection.close();
        console.log('MongoDB Connection Closed');
    }
})
.catch(err => {
    console.error('MongoDB Connection Error:', err);
}); 