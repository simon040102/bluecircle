var express = require('express');
var router = express.Router();
var Url = require('../models/urlModel');
var parser = require('ua-parser-js');
const clickedInf = require('../models/clickedInfModel');
const appError = require('../service/appError');

/* GET home page. */
router.get('/:id', async function (req, res, next) {
  const url = req.params.id;
  var ua = parser(req.headers['user-agent']);
  const findUrl = await Url.find({ shortUrl: url });
  // console.log(ua);
  const clicked = {
    UserBowse: ua.browser.name,
    UserInform: ua.ua,
    UserSystem: ua.os.name,
  };
  if (findUrl.length == 0) {
    return next(appError('400', '網址錯誤', next));
  }
  if (url.length == 6) {
   await clickedInf.updateOne(
      { shortUrl: url },
      {
        $addToSet: {
          clicked: {
            UserBowse: ua.browser.name,
            UserInform: ua.ua,
            UserSystem: ua.os.name,
          },
        },
      }
    );
    const originUrl = findUrl[0].url;
    res.redirect(`${originUrl}`);
    
  } else {
    {
      res.render('index', { title: 'Express' });
    }
  }
});

module.exports = router;
