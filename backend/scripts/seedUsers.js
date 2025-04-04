const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../model/user');

// Sample users to seed
const users = [
  {
    email: 'admin@school.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    email: 'student1@school.com',
    password: 'student123',
    role: 'student'
  },
  {
    email: 'teacher1@school.com',
    password: 'teacher123',
    role: 'teacher'
  }
];

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('✅ MongoDB Connected Successfully');
  
  try {
    // Check if users already exist
    const userCount = await User.countDocuments();
    console.log(`📊 Current number of users in the database: ${userCount}`);
    
    if (userCount > 0) {
      console.log('⚠️ Users already exist in the database. Skipping seed operation.');
      console.log('⚠️ If you want to reseed, please drop the users collection first.');
    } else {
      // Create users with hashed passwords
      for (const userData of users) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = new User({
          email: userData.email,
          password: hashedPassword,
          role: userData.role
        });
        
        await user.save();
        console.log(`✅ Created user: ${userData.email} (${userData.role})`);
      }
      
      console.log('🌱 Seeding completed successfully!');
    }
    
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('👋 MongoDB Connection Closed');
  }
})
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err);
}); 