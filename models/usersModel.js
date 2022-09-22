const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '請輸入您的名字'],
  },
  email: {
    type: String,
    required: [true, '請輸入您的 Email'],
    unique: true,
    lowercase: true,
    select: false,
  },
  photo: {
    type: String,
    default: 'https://i.imgur.com/ztA4pUK.png',
  },
  password: {
    type: String,
    required: [true, '請輸入密碼'],
    minlength: 8,
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    select: false,
  },
});
// User
const User = mongoose.model('user', userSchema);

module.exports = User;
