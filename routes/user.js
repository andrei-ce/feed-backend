const express = require('express');
const { validateStatus } = require('../middleware/validators');

const userController = require('../controllers/user');
const isAuth = require('../middleware/isAuth');

const router = express.Router();

// GET /user/status
router.get('/status', isAuth, userController.getStatus);

// PUT /user/status
router.put('/status', isAuth, validateStatus, userController.updateStatus);

module.exports = router;
