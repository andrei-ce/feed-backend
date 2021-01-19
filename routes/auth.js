const express = require('express');
const authController = require('../controllers/auth');
const { validateSignup } = require('../middleware/validators');

const router = express.Router();

router.post('/signup', validateSignup, authController.signup);

router.post('/login', authController.login);

module.exports = router;
