const passport=require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const User = require('../models/usersModel');
const bcrypt=require('bcryptjs')

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
      // callbackURL: 'http://localhost:3006/users/google/callback',
    },
    async function (accessToken, refreshToken, profile, cb) {
      const user = await User.findOne({ googleId: profile.id });
      if (user) {
        return cb(null, user);
      }
      const password = await bcrypt.hash('FD4dsg4t54GFtedfTE', 12);
      console.log(profile);
      const newUser = await User.create({
        email: profile.emails[0].value,
        name: profile.displayName,
        password,
        googleId: profile.id,
      });
      return cb(null, newUser);
    }
  )
);

