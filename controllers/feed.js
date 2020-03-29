const { validationResult } = require('express-validator/check')

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
    return res.status(422).json({
      message: 'Validation failed',
      error: errors.array()
    })
  }
  const { title, content } = req.body
  console.log(req.body)
  res.status(201).json({
    message: 'Post created successfully',
    post: {
      _id: new Date().toISOString(),
      title: title,
      content: content,
      creator: {
        name: 'Dinika'
      },
      createdAt: new Date()
    }
  })
}