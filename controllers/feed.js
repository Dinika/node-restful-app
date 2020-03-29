const { validationResult } = require('express-validator')
const Post = require('../models/post')

exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        _id: '1',
        title: 'First post',
        content: 'Woah',
        images: 'images/david.png',
        creator: {
          name: 'Dinika'
        },
        createdAt: new Date()
      }
    ]
  })
}

exports.createPost = (req, res, next) => {
  // Create post in db
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect')
    error.statusCode = 422
    throw error
  }
  const { title, content } = req.body
  const post = new Post({
    title: title,
    content: content,
    imageUrl: 'images/david.png',
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