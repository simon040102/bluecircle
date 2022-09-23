var express = require('express');
var router = express.Router();
var Url = require('../models/urlModel');
var parser = require('ua-parser-js');
const clickedInf = require('../models/clickedInfModel');
const appError = require('../service/appError');
const os = require('os');

/* GET home page. */
router.get('/:id', async  (req, res, next)=> {
  const url = req.params.id;
  var ua = parser(req.headers['user-agent']);
  const findUrl = await Url.find({ shortUrl: url });
  const mac_ip = await os.networkInterfaces()
  console.log(mac_ip);
  const mac =  mac_ip.eth0[0].mac;// 網路版 ;
  //   mac_ip.en0[0].mac //本地版
  // mac_ip.eth0[0].mac;// 網路版
  const clicked = {
    UserBowse: ua.browser.name,
    UserInform: mac,
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
           UserInform: mac,
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
