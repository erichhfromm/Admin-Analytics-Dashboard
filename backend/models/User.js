const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['Admin', 'Editor', 'User'], default: 'User' },
  status: { type: String, enum: ['Active', 'Inactive', 'Pending'], default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
