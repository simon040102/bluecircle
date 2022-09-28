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
    const check = await Url.find({ url: back, userId: userId });
    const checkShortUrl = await Url.findOne({ shortUrl: req.body.shortUrl });
    console.log(checkShortUrl);
    if (checkShortUrl) {
      return next(appError('400', '網址已被使用', next));
    }
    if (check.length > 0) {
      return next(appError('400', '網址已申請過', next));
    } else {
      if (shortUrl) {
        garbled = shortUrl;
      }
      const clickId = await clickedInf.create({
        shortUrl: garbled,
        userId: userId,
      });
      const newUrl = await Url.create({
        userId: userId,
        url: back,
        shortUrl: garbled,
        urlId: clickId._id,
      });

      res.status(200).json({
        status: 'success',
        newUrl,
      });
    }
  })
);

router.get(
  '/',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const userId = req.user._id;
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const q = req.query.q;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    // const timeSort = req.query.timeSort == 'asc' ? '-createdAt' : 'createdAt';
    // const sort =
    //   req.query.sort == 'click' ? 'notRepeatTimes' : '-notRepeatTimes';
    const sort = req.query.sort;
    if (page && limit) {
      const results = {};

      if (
        endIndex < (await Url.find({ userId: userId }).countDocuments().exec()) && q==undefined
      ) {
        results.next = {
          page: page + 1,
          limit: limit,
        };
      }

      if (startIndex > 0) {
        results.previous = {
          page: page - 1,
          limit: limit,
        };
      }
      try {
        if (q !== undefined) {
          var reg = new RegExp(q, 'i');
          sort == 'asc' ? 'createdAt' : '-notRepeatTimes';
          const filter = {
            $or: [
              { url: { $regex: reg } },
              { shortUrl: { $regex: reg } },
              { tag: { $regex: reg } },
              { description: { $regex: reg } },
              { title: { $regex: reg } },
            ],
          };
          if (endIndex < (await Url.find(filter).countDocuments().exec())) {
            results.next = {
              page: page + 1,
              limit: limit,
            };
          }

          if (startIndex > 0) {
            results.previous = {
              page: page - 1,
              limit: limit,
            };
          }
          const urlList = await Url.find(filter)
            .sort(sort)
            .limit(limit)
            .skip(startIndex);
          res.status(200).json({
            status: 'success',
            page: results,
            urlList,
          });
          return
        }
        if (sort == 'asc') {
          const urlList = await Url.find({ userId: userId })
            .sort('createdAt')
            .limit(limit)
            .skip(startIndex);

          res.status(200).json({
            status: 'success',
            page: results,
            urlList,
          });
        } if (sort == 'clicked') {
          const urlList = await Url.find({ userId: userId })
            .sort({ notRepeatTimes: -1 })
            .limit(limit)
            .skip(startIndex);

          res.status(200).json({
            status: 'success',
            page: results,
            urlList,
          });
        } else {
          const urlList = await Url.find({ userId: userId })
            .sort('-createdAt')
            .limit(limit)
            .skip(startIndex);
          res.status(200).json({
            status: 'success',
            page: results,
            urlList,
          });
        }
      } catch (e) {
        res.status(500).json({ message: e.message });
      }
    }
    //  else if(q){
    //    const q =
    //      req.query.q !== undefined ? { "url": new RegExp(req.query.q) } : {};
    //    const result = await Url.find(q);
    //   res.status(200).json({
    //     status: 'success',
    //     data: result,
    //   });

    //  }
  })
);

router.get(
  '/list',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const userId = req.user._id;
    const urlList = await Url.find({ userId: userId });
    console.log(urlList);
    res.status(200).json({
      status: 'success',
      urlList: urlList,
    });
  })
);
function removeDuplicates(originalArray, prop) {
  var newArray = [];
  var lookupObject = {};

  for (var i in originalArray) {
    lookupObject[originalArray[i][prop]] = originalArray[i];
  }

  for (i in lookupObject) {
    newArray.push(lookupObject[i]);
  }
  return newArray;
}

router.get(
  '/:id',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const urlId = req.params.id;
    console.log(urlId);

    const url = await clickedInf.findOne({ id: urlId });
    const clicked = url.clicked;
    const NotRepeating = removeDuplicates(clicked, 'UserInform');
    console.log(clicked.length, NotRepeating.length);
    res.status(200).json({
      status: 'success',
      repeatTimes: clicked.length,
      notRepeatTimes: NotRepeating.length,
      notRepeatList: NotRepeating,
    });
  })
);

router.patch(
  '/:id/',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const urlId = req.params.id;
    const newInf = req.body;

    await Url.findByIdAndUpdate({ _id: urlId }, newInf);
    res.status(200).json({
      status: 'success',
    });
  })
);
router.delete(
  '/:id/',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const urlId = req.params.id;

    await Url.findOneAndDelete({ urlId: urlId });
    await clickedInf.findOneAndDelete({ _id: urlId });
    res.status(200).json({
      status: 'success',
      message:'刪除成功'
    });
  })
);


router.post(
  '/:id/tag',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const urlId = req.params.id;
    const tagAry = req.body.tag;
    await tagAry.forEach(async (item) => {
      await Url.findOneAndUpdate(
        { _id: urlId },
        {
          $addToSet: { tag: item },
        }
      );
    });
    const newUrl = await Url.find({ _id: urlId });
    res.status(200).json({
      status: 'success',
      newUrl,
    });
  })
);
router.delete(
  '/:id/tag',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const urlId = req.params.id;
    const tagAry = req.body.tag;
    await tagAry.forEach(async (item) => {
      await Url.findOneAndUpdate(
        { _id: urlId },
        {
          $pull: { tag: item },
        }
      );
    });
    const newUrl = await Url.findOne({ _id: urlId });
    res.status(200).json({
      status: 'success',
      newUrl,
    });
  })
);

module.exports = router;
