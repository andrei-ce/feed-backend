const { check, body } = require('express-validator');
const User = require('../models/user');

exports.validateCreatePost = [
  body('title').trim().isLength({ min: 5 }),
  body('content').trim().isLength({ min: 5 }),
];

exports.validateSignup = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email is not valid')
    .custom(async (value, { req }) => {
      let userExists = await User.findOne({ email: value });
      if (userExists) {
        throw new Error('Email address already in use');
      } else {
        return true;
      }
    })
    .normalizeEmail(),
  body('password').trim().isLength({ min: 6 }),
  body('name').trim().not().isEmpty(),
];

exports.validateStatus = [
  body('userStatus', 'Status too short').trim().not().isEmpty(),
];
