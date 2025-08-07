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
  mobile:{
    type:String,
  },
  location:{
    type:String
  },
  password: {
    type: String,
    required: true,
  },
  instagram:{
    type:String,
  },
  facebook:{
    type:String
  },
  tiktok:{
    type:String
  },
  whatsapp:{
    type:String
  },
  youtubeChanel:{
    type:String
  },
  role:{type: String, enum:['customer','provider','guide','admin']},
  status: {
  type: String,
  enum: ['pending', 'approved', 'suspended'],
  default: 'approved' // For travelers, default to approved
},

  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);