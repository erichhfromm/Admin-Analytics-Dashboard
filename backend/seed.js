const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

const INITIAL_USERS = [
  { name: 'Alice Smith', email: 'alice@example.com', role: 'Admin', status: 'Active' },
  { name: 'Bob Jones', email: 'bob@example.com', role: 'User', status: 'Active' },
  { name: 'Charlie Brown', email: 'charlie@example.com', role: 'Editor', status: 'Inactive' },
  { name: 'Diana Prince', email: 'diana@example.com', role: 'User', status: 'Active' },
  { name: 'Evan Peters', email: 'evan@example.com', role: 'User', status: 'Pending' },
  { name: 'Fiona Gallagher', email: 'fiona@example.com', role: 'Admin', status: 'Active' },
];

const seedDB = async () => {
    try {
        await connectDB();
        await User.deleteMany(); // Clear existing
        console.log('Previous users deleted.');
        
        await User.insertMany(INITIAL_USERS);
        console.log('Database Seeded Successfully with Dummy Users!');
        
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedDB();
