const { validationResult } = require('express-validator')
const Post = require('../models/post')
const User = require('../models/user')
//const io = require('../socket')

exports.getPosts = async (req, res, next) => {
  const page = req.query.page || 1
  const perPage = 2

  try {
    const totalItems = await Post.find().countDocuments()
    const posts = await Post.find()
      .populate('creator')
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)

    res.status(200).json({
      message: 'Posts fetched successfully',
      posts: posts,
      totalItems: totalItems
    })
  }
  catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.createPost = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect')
    error.statusCode = 422
    throw error
  }

  if (!req.file) {
    const error = new Error('No image provided')
    error.statusCode = 422
    throw error
  }
  const imageUrl = req.file.path
  const { title, content } = req.body
  let creator
  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId
  })
  return post
    .save()
    .then(result => {
      return User.findById(req.userId)
    })
    .then(user => {
      creator = user
      user.posts.push(post)
      return user.save()
    })
    .then(result => {
      const updatedCreator = { _id: req.userId, name: creator.name }
      // io.getIO().emit('posts', {
      //   action: 'create',
      //   post: {
      //     ...post._doc,
      //     creator: {
      //       _id: req.userId,
      //       name: creator.name
      //     }
      //   }
      // })
      res.status(201).json({
        message: 'Post created successfully',
        post: post,
        creator: {
          _id: creator._id,
          name: creator.name
        }
      })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500
      }
      next(err)
    })

}

exports.getPost = (req, res, next) => {
  const postId = req.params.postId
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Could not find the post')
        error.statusCode = 404
        throw error
      }
      console.log("POST", post)
      res.status(200)
        .json({
          message: 'Post found',
          post: post
        })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500
      }
      next(err)
    })
}

exports.updatePost = (req, res, next) => {
  const postId = req.params.postId
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect')
    error.statusCode = 422
    throw error
  }
  const { title, content } = req.body
  const imageUrl = req.file ? req.file.path : req.body.image
  if (!imageUrl) {
    const error = new Error('No image uploaded')
    error.statusCode = 422
    throw error
  }
  Post.findById(postId).populate('creator')
    .then(post => {
      if (!post) {
        const error = new Error('Could not find the post')
        error.statusCode = 404
        throw error
      }
      if (post.creator._id.toString() !== req.userId) {
        const authError = new Error('Not Authorized')
        authError.statusCode = 403
        throw authError
      }
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl)
      }
      post.title = title
      post.imageUrl = imageUrl
      post.content = content
      return post.save()
    })
    .then(result => {
      // io.getIO().emit('posts', {
      //   action: 'update',
      //   post: result
      // })
      res.status(201).json({
        message: 'Post successfully updated',
        post: result
      })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500
      }
      next(err)
    })
}

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Could not find the post')
        error.statusCode = 404
        throw error
      }
      if (post.creator.toString() !== req.userId) {
        const authError = new Error('Not Authorized')
        authError.statusCode = 403
        throw authError
      }
      clearImage(post.imageUrl)
      return Post.findByIdAndRemove(postId)
    })
    .then(result => {
      return User.findById(req.userId)
    })
    .then(user => {
      user.posts.pull(postId)
      return user.save()
    })
    .then(result => {
      //io.getIO().emit('posts', { action: 'delete', post: postId })
      res.status(200).json({ message: 'Post deleted' })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500
      }
      next(err)
    })
}
