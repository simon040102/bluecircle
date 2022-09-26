const mongoose = require('mongoose');
const clickedInfSchema = new mongoose.Schema({
  shortUrl: {
    type: String,
    require: true,
  },
  clicked: [
    {
      UserBowse: { type: String },
      UserInform: { type: String },
      UserSystem: { type: String },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'user',
  },
  urlId: {
    type: mongoose.Schema.ObjectId,
    ref:'clickedinf'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    select: false,
  },
  repeatTimes: { type: String },
  notRepeatTimes: { type: String },
});
// url
const ClickedInf = mongoose.model('clickedInf', clickedInfSchema);

module.exports = ClickedInf;
