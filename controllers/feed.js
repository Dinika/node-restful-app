const { validationResult } = require('express-validator')
const Post = require('../models/post')
const fs = require('fs')
const path = require('path')

exports.getPosts = (req, res, next) => {
  const page = req.query.page || 1
  const perPage = 2
  let totalItems
  Post.find().countDocuments()
    .then(count => {
      totalItems = count
      return Post.find()
        .skip((page - 1) * perPage)
        .limit(perPage)
    })
    .then(posts => {
      res.status(200).json({
        message: 'Posts fetched successfully',
        posts: posts,
        totalItems: totalItems
      })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500
      }
      next(err)
    })
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
  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: {
      name: 'Dinika'
    }
  })
  post
    .save()
    .then(result => {
      res.status(201).json({
        message: 'Post created successfully',
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
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Could not find the post')
        error.statusCode = 404
        throw error
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
      // CHeck post belongs to user
      clearImage(post.imageUrl)
      if (!post) {
        const error = new Error('Could not find the post')
        error.statusCode = 404
        throw error
      }
      return Post.findByIdAndRemove(postId)
    })
    .then(result => {
      res.status(200).json({ message: 'Post deleted' })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500
      }
      next(err)
    })
}

const clearImage = (filePath) => {
  filePath = path.join(__dirname, '..', filePath)
  fs.unlink(filePath, err => {
    console.log(err)
  })
}