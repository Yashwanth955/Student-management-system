const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../model/user');

// Connection details
console.log('🔧 MongoDB Connection URI:', process.env.MONGO_URI || 'No URI found in .env');
console.log('🔑 JWT Secret exists:', !!process.env.JWT_SECRET);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('✅ MongoDB Connected Successfully');
  
  try {
    // Test if User model is working
    const userCount = await User.countDocuments();
    console.log(`📊 Number of users in the database: ${userCount}`);
    
    if (userCount === 0) {
      console.log('⚠️ No users found in the database. You may need to add some users.');
    } else {
      // Get sample user data (without password)
      const users = await User.find({}, { password: 0 }).limit(3);
      console.log('📋 Sample users (without passwords):');
      users.forEach(user => {
        console.log(`  - ${user.email} (${user.role})`);
      });
    }
    
    // Test database collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📚 Available collections:');
    collections.forEach(collection => {
      console.log(`  - ${collection.name}`);
    });
    
  } catch (error) {
    console.error('❌ Error testing database:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('👋 MongoDB Connection Closed');
  }
})
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err);
}); 