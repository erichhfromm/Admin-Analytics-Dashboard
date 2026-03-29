const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  userId: { type: String, default: 'admin_user' }, // Static for now as we use fake auth
  name: { type: String, default: 'Admin User' },
  email: { type: String, default: 'admin@demo.com' },
  avatar: { type: String, default: 'A' },
  avatarUrl: { type: String, default: '' },
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    updates: { type: Boolean, default: false }
  },
  theme: { type: String, default: 'light' }
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
