const express = require('express');
const appError = require('../service/appError');
const jwt = require('jsonwebtoken');
const Url = require('../models/urlModel');
const { isAuth, generateSendJWT } = require('../service/auth');
const router = express.Router();
const handleErrorAsync = require('../service/handleErrorAsync');
const random = require('../service/random');
const clickedInf = require('../models/clickedInfModel');


router.post(
  '/',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const userId = req.user._id;
    const back = req.body.url;
    const shortUrl = req.body.shortUrl;
    let garbled = random();
    const check = await Url.find({ url: back,userId:userId });
    const checkShortUrl = await Url.findOne({ shortUrl: req.body.shortUrl });
    console.log(checkShortUrl);
    if (checkShortUrl) {
      return next(appError('400', '網址已被使用', next));
    }
      if (check.length > 0) {
        return next(appError('400', '網址已申請過', next));
      } else {
        if(shortUrl){
            garbled = shortUrl;
        }
        const newUrl = await Url.create({
          userId: userId,
          url: back,
          shortUrl: garbled,
        });
        clickedInf.create({
          shortUrl: garbled,
          userId: userId,
        });
        res.status(200).json({
          status: 'success',
          newUrl,
        });
      }
  })
);

module.exports = router;
