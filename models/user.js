const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role:{type: String, enum:['traveler','provider','guide','admin']},
  status: {
  type: String,
  enum: ['pending', 'approved', 'suspended'],
  default: 'approved' // For travelers, default to approved
},
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);