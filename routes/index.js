var express = require('express');
var router = express.Router();
var Url = require('../models/urlModel');
var parser = require('ua-parser-js');
const clickedInf = require('../models/clickedInfModel');
const appError = require('../service/appError');
const os = require('os');
let ejs = require('ejs');
let app=express();
app.set('view engine', 'ejs'); 

/* GET home page. */
router.get('/:id', async  (req, res, next)=> {
  const url = req.params.id;
  var ua = parser(req.headers['user-agent']);
  const findUrl = await Url.find({ shortUrl: url });
  const ip = req.socket.remoteAddress;
  // const mac =   mac_ip.en0[0].mac 
  //   mac_ip.en0[0].mac //本地版
  // mac_ip.eth0[0].mac;// 網路版
  const clicked = {
    UserBowse: ua.browser.name,
    UserInform: ip,
    UserSystem: ua.os.name,
  };
  if(!url){ res.render('index', { title: 'Express' });}
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
           UserInform: ip,
           UserSystem: ua.os.name,
         },
       },
     }
   );
    res.render('index', {
      images: findUrl[0].photo,
      description: findUrl[0].description,
      title: findUrl[0].title,
      url:findUrl[0].url
    });
    
  }
});

module.exports = router;
