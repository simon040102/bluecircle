const express = require('express');
const bcrypt = require('bcryptjs');
const appError = require('../service/appError');
const jwt = require('jsonwebtoken');
const handleErrorAsync = require('../service/handleErrorAsync');
const validator = require('validator');
const User = require('../models/usersModel');
const nodemailer = require('nodemailer');
const {
  isAuth,
  generateSendJWT,
  forgetPasswordJWT,
  googleLoginJWT,
} = require('../service/auth');
const router = express.Router();
const passport=require('passport')





router.post(
  '/sign_up',
  handleErrorAsync(async (req, res, next) => {
    let { email, password, confirmPassword, name } = req.body;
    const checkMail = await User.findOne({ email }, email);
    if (checkMail) {
      return next(appError('400', '帳號已被註冊', next));
    }
    if (!email || !password || !confirmPassword || !name) {
      // 內容不可為空
      return next(appError('400', '欄位未填寫正確！', next));
    }
    // 密碼正確
    if (password !== confirmPassword) {
      return next(appError('400', '密碼不一致！', next));
    }
    // 密碼至少一個大寫和一個符號
    if (
      !validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 0,
        minUppercase: 1,
        minNumbers: 0,
        minSymbols: 1,
        returnScore: false,
        pointsPerUnique: 0,
        pointsPerRepeat: 0,
        pointsForContainingLower: 0,
        pointsForContainingUpper: 0,
        pointsForContainingNumber: 0,
        pointsForContainingSymbol: 0,
      })
    ) {
      return next(appError('400', '密碼至少8碼，一個大寫和一個符號', next));
    }

    // 是否為 Email
    if (!validator.isEmail(email)) {
      return next(appError('400', 'Email 格式不正確', next));
    }

    // 加密密碼
    password = await bcrypt.hash(req.body.password, 12);
    const newUser = await User.create({
      email,
      password,
      name,
    });
    generateSendJWT(newUser, 201, res);
  })
);

router.patch(
  '/updatePassword',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const { password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      return next(appError('400', '密碼不一致！', next));
    }
    newPassword = await bcrypt.hash(password, 12);

    const user = await User.findByIdAndUpdate(req.user.id, {
      password: newPassword,
    });
    generateSendJWT(user, 200, res);
  })
);

router.post(
  '/sign_in',
  handleErrorAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(appError(400, '帳號密碼不可為空', next));
    }
    const user = await User.findOne({ email }).select('+password');
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return next(appError(400, '您的密碼不正確', next));
    }
    generateSendJWT(user, 200, res);
  })
);

router.get(
  '/profile/',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    res.status(200).json({
      status: 'success',
      user: req.user,
    });
  })
);

router.patch(
  '/profile/',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const newProfile = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, newProfile);
    res.status(200).json({
      status: 'success',
      newProfile,
    });
  })
);

router.post(
  '/forget', handleErrorAsync(async (req, res, next) => {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_FROM,
        pass: process.env.MAIL_PASSWORD,
      },
    });
    const {email}=req.body
    const user = await User.findOne({ email });
    if(!user){return next(appError(400, '查無此email', next));}
    const token = forgetPasswordJWT(user, res);
    transporter
      .sendMail({
        from: process.env.MAIL_FROM,
        to: email,
        subject: 'BlueCircle 忘記密碼驗證信',
        html: `<p>請點擊連擊修改密碼<p/><a href="http://127.0.0.1:5173/#/changepassword/${token}">驗證連結</a>`,
      })
      .then((info) => {
        console.log({ info });
      })
      .catch(err=>{
        console.log(err)
      });
    
    res.status(200).json({
      status: 'success',
      message:'已寄出驗證信'
    });
  })
);
router.get('/google',passport.authenticate('google',{
  scope:['email','profile']
}))

router.get('/google/callback',passport.authenticate('google',{session:false}),(req,res)=>{
  googleLoginJWT(req.user,res);

  // res.send({
  //   status:'success',
  //   data:req.user
  // })
})

module.exports = router;
