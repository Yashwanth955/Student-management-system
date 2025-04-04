const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(async () => {
    console.log('✅ MongoDB Connected');
    
    try {
        // Check for admin user
        const adminUser = await mongoose.connection.db.collection('users').findOne({ role: 'admin' });
        
        if (adminUser) {
            console.log('✅ Admin user found:', {
                email: adminUser.email,
                role: adminUser.role,
                name: adminUser.name
            });
        } else {
            console.log('❌ No admin user found in the database');
        }

        // Count total users
        const totalUsers = await mongoose.connection.db.collection('users').countDocuments();
        console.log(`Total users in database: ${totalUsers}`);

        // List all users
        const allUsers = await mongoose.connection.db.collection('users').find({}, { projection: { email: 1, role: 1, _id: 0 } }).toArray();
        console.log('All users:', allUsers);

    } catch (error) {
        console.error('Error checking admin user:', error);
    } finally {
        await mongoose.connection.close();
        console.log('MongoDB Connection Closed');
    }
})
.catch(err => {
    console.error('MongoDB Connection Error:', err);
}); 