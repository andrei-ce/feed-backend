const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

const Post = require('../models/post');
const User = require('../models/user');
const io = require('../socket');

exports.getPosts = async (req, res, next) => {
  try {
    //pagination
    const currentPage = req.params.page || 1;
    const perPage = 2;

    const totalItems = await Post.find().countDocuments();

    const posts = await Post.find()
      .populate('creator', '-password')
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    // console.log(posts);
    if (!posts) {
      const err = new Error('No posts not found');
      err.statusCode = 404;
      return next(err);
    }
    res.status(200).json({
      message: 'Post fetched successfully',
      posts: posts,
      totalItems: totalItems,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.getPost = async (req, res, next) => {
  try {
    //inputs
    const postId = req.params.postId;
    const post = await Post.findById(postId);
    if (!post) {
      const err = new Error('Post not found');
      err.statusCode = 404;
      return next(err);
    }

    res.status(200).json({ message: 'Post fetched successfully', post });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.createPost = async (req, res, next) => {
  try {
    //errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array());
      const error = new Error('Validation failed.');
      error.statusCode = 422;
      error.details = errors.array();
      return next(error);
    }

    if (!req.file) {
      const error = new Error('No file found');
      error.statusCode = 422;
      error.details = errors.array();
      return next(error);
    }

    //inputs
    const { title, content } = req.body;
    const imageUrl = req.file.path; //multer generates file.path

    //create post in db
    const post = new Post({
      title,
      content,
      imageUrl,
      creator: req.userId,
    });

    let savedPost = await post.save();

    let user = await User.findById(req.userId);
    let creator = user;
    user.posts.push(post);
    await user.save();

    //socketIO (obs: emit() sends to all user, broadcast() to all but the one sending)
    io.getIO().emit('posts', {
      action: 'create',
      post: { ...post._doc, creator: { _id: req.userId, name: user.name } },
    });

    //answer
    res.status(201).json({
      message: 'Post created successfully!',
      post: savedPost,
      creator: { _id: creator._id, name: creator.name },
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    //validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array());
      const error = new Error('Validation failed.');
      error.statusCode = 422;
      error.details = errors.array();
      return next(error);
    }

    //inputs
    const { title, content } = req.body;
    let postId = req.params.postId;

    //fetch post
    let post = await Post.findById(postId).populate('creator', '-password');
    if (!post) {
      let err = new Error('Could not find requested post');
      err.statusCode = 404;
      return next(err);
    }

    if (post.creator._id.toString() !== req.userId) {
      let err = new Error('Unauthorized');
      err.statusCode = 403;
      return next(err);
    }

    //we either are uploading an image, or we already have a imageURL from db, in which case we do nothing
    let imageUrl;
    if (req.file) {
      imageUrl = req.file.path;
    } else {
      imageUrl = post.imageUrl;
    }
    //delete only if post.imageUrl is different from what we are sending (req.file.path)
    if (post.imageUrl !== imageUrl) {
      clearImage(post.imageUrl);
    }

    //update post object
    post.title = title;
    post.content = content;
    post.imageUrl = imageUrl;

    //answer
    let updatedPost = await post.save();
    //socketIO (obs: emit() sends to all user, broadcast() to all but the one sending)
    io.getIO().emit('posts', {
      action: 'update',
      post: updatedPost,
    });

    res.status(200).json({ message: 'Post updated!', post: updatedPost });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    let post = await Post.findById(postId);
    if (!post) {
      let err = new Error('Could not find requested post');
      err.statusCode = 404;
      return next(err);
    }
    if (post.creator._id.toString() !== req.userId) {
      let err = new Error('Unauthorized');
      err.statusCode = 403;
      return next(err);
    }

    //TODO: check if the user had created this post
    clearImage(post.imageUrl);
    let deletedPost = await Post.findByIdAndDelete(postId);

    //remove relation with user
    const user = await User.findById(req.userId).select('-password');
    //NEW MONGOOSE METHOD!
    user.posts.pull(postId);
    await user.save();

    io.getIO().emit('posts', { action: 'delete', post: postId });
    res.status(200).json({ message: 'Post deleted!', post: deletedPost });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

//
//
//
//
//============= HELPER FUNCTIONS ==============

const clearImage = (filePath) => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, (err) => {
    console.log(err);
  });
};
