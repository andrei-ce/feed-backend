const express = require('express');
const { validateCreatePost } = require('../middleware/validators');

const feedController = require('../controllers/feed');
const isAuth = require('../middleware/isAuth');

const router = express.Router();

// GET /feed/posts
router.get('/posts', isAuth, feedController.getPosts);

// POST /feed/post
router.post('/post', isAuth, validateCreatePost, feedController.createPost);

// GET /feed/post
router.get('/post/:postId', isAuth, feedController.getPost);

// PUT /feed/post
router.put('/post/:postId', isAuth, validateCreatePost, feedController.updatePost);

// DELETE /feed/post
router.delete('/post/:postId', isAuth, feedController.deletePost);

module.exports = router;
