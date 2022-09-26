var express = require('express');
var router = express.Router();
var Url = require('../models/urlModel');
var parser = require('ua-parser-js');
const clickedInf = require('../models/clickedInfModel');
const appError = require('../service/appError');
const os = require('os');
let ejs = require('ejs');
const { url } = require('inspector');
let app=express();
app.set('view engine', 'ejs'); 


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

/* GET home page. */
router.get('/:id', async  (req, res, next)=> {
  const url = req.params.id;
  var ua = parser(req.headers['user-agent']);
  const findUrl = await Url.find({ shortUrl: url });
  const ip = req.socket.remoteAddress;
  // const mac =   mac_ip.en0[0].mac 
  //   mac_ip.en0[0].mac //本地版
  // mac_ip.eth0[0].mac;// 網路版
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
   const checkClicked= await clickedInf.find({shortUrl:url})
   const clicked = checkClicked[0].clicked;
   const NotRepeating = removeDuplicates(clicked, 'UserInform');
   await clickedInf.findOneAndUpdate(
     { shortUrl: url },
     {
       repeatTimes: clicked.length,
       notRepeatTimes: NotRepeating.length,
     }
   );
   await Url.findOneAndUpdate(
     { shortUrl: url },
     {
       repeatTimes: clicked.length,
       notRepeatTimes: NotRepeating.length,
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
