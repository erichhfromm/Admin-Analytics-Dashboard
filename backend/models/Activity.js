const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  adminId: { type: String, required: true },
  adminName: { type: String, required: true },
  action: { type: String, required: true }, // e.g., 'Created user', 'Deleted user'
  target: { type: String }, // e.g., 'Bob Jones'
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Activity', ActivitySchema);
