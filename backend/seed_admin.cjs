const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = 'mongodb://127.0.0.1:27017/admin_dashboard';

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected to seed admin...');

    // Delete existing admin for clean seed
    await Admin.deleteMany({ email: 'admin@demo.com' });

    const admin = new Admin({
      name: 'Admin User',
      email: 'admin@demo.com',
      password: 'admin'
    });

    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(admin.password, salt);

    await admin.save();
    console.log('✅ Admin seeded successfully!');
    console.log('Email: admin@demo.com');
    console.log('Password: admin');
    
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedAdmin();
