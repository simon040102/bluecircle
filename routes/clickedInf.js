const express = require('express');
const bcrypt = require('bcryptjs');
const appError = require('../service/appError');
const jwt = require('jsonwebtoken');
const handleErrorAsync = require('../service/handleErrorAsync');
const validator = require('validator');
const clickedInf = require('../models/clickedInfModel');
const { isAuth, generateSendJWT } = require('../service/auth');
const router = express.Router();




module.exports = router;
