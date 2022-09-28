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
    ref: 'clickedinf',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    select: false,
  },
  repeatTimes: { type: Number, default: 0 },
  notRepeatTimes: { type: Number, default: 0 },
});
// url
const ClickedInf = mongoose.model('clickedinf', clickedInfSchema);

module.exports = ClickedInf;
