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
  createdAt: {
    type: Date,
    default: Date.now,
    select: false,
  },
});
// url
const clickedInf = mongoose.model('clickedInf', clickedInfSchema);

module.exports = clickedInf;
