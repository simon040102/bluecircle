const mongoose = require('mongoose');
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
  title:{
    type:String,
  },
  description:{type:String},
  photo:{
    type:String
  },
  tag:[String],
  createdAt: {
    type: Date,
    default: Date.now,
    select: false,
  },
 
});
// url
const Url = mongoose.model('url', urlSchema);

module.exports = Url;
