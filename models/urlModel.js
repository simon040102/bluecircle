const mongoose = require('mongoose');
const clickedInf = require('./clickedInfModel');
const urlSchema = new mongoose.Schema({
  url: {
    type: String,
    required: [true, '請輸入網址'],
  },
  shortUrl: {
    type: String,
    required: [true, ' 請輸入短網址'],
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'user',
    require: [true, 'user must belong to a post.'],
  },
  title: {
    type: String,
    default: '',
  },
  description: { type: String, default: '' },
  photo: {
    type: String,
    default: '',
  },
  tag: [String],
  createdAt: {
    type: Date,
    default: Date.now,
    select: false,
  },
  urlId: {
    type: mongoose.Schema.ObjectId,
    ref: 'clickedinf',
  },
  repeatTimes: { type: String },
  notRepeatTimes: { type: String },
});
// url
const Url = mongoose.model('url', urlSchema);

module.exports = Url;
