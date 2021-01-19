const User = require('../models/user');
const { validationResult } = require('express-validator');

exports.getStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      const error = new Error('No user found');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({ message: 'Status fetched', status: user.status });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
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
    const { userStatus } = req.body;
    const user = await User.findById(req.userId).select('-password');

    //user handling
    if (!user) {
      const error = new Error('No user found');
      error.statusCode = 404;
      return next(error);
    }

    user.status = userStatus;
    await user.save();

    res.status(200).json({ message: 'Status updated', userStatus: userStatus });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
