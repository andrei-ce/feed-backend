const { validationResult } = require('express-validator');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

exports.signup = async (req, res, next) => {
  try {
    //validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array());
      const error = new Error('Validation failed');
      error.statusCode = 422;
      error.details = errors.array();
      return next(error);
    }

    //inputs
    const { email, name, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);

    //create User
    const user = new User({
      email,
      name,
      password: hashedPassword,
    });

    //save & answer
    const newUser = await user.save();
    res.status(201).json({ message: 'User created!', userId: newUser._id });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    //inputs
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error('Invalid credentials!');
      error.statusCode = 401;
      error.details = errors.array();
      return next(error);
    }

    //bcrypt comparison
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error('Invalid credentials!');
      error.statusCode = 401;
      error.details = errors.array();
      return next(error);
    }

    //JWT
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      config.get('JWT_SECRET'),
      { expiresIn: '1h' }
    );

    //save & answer
    res.status(201).json({
      message: 'Login successfull',
      token: token,
      userId: user._id.toString(),
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
