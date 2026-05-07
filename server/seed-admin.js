const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB Connected');
    
    // Check if admin exists
    const adminExists = await User.findOne({ email: 'admin@kinetic.pro' });
    
    if (!adminExists) {
      await User.create({
        name: 'Super Admin',
        email: 'admin@kinetic.pro',
        password: 'password123',
        role: 'admin'
      });
      console.log('👑 Super Admin created: admin@kinetic.pro / password123');
    } else {
      console.log('ℹ️ Admin already exists');
    }
    
    process.exit();
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
