exports.getPosts = (req, res, next) => {
  console.log("HERE")
  res.status(200).json({
    posts: [
      {
        title: 'First post',
        content: 'Woah'
      }
    ]
  })
}
