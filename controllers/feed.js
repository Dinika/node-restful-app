exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        title: 'First post',
        content: 'Woah'
      }
    ]
  })
}

exports.createPosts = (req, res, next) => {
  // Create post in db
  const { title, content } = req.body
  console.log(req.body)
  res.status(201).json({
    message: 'Post created successfully',
    post: {
      id: new Date().toISOString(),
      title: title,
      content: content
    }
  })
}