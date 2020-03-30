const User = require('../models/user')

exports.getStatus = (req, res, next) => {
  const userId = req.userId
  if (!userId) {
    const error = new Error('Not authenticated')
    error.statusCode = 401
    throw error
  }

  User.findById(userId)
    .then(user => {
      if (!user) {
        const error = new Error('User not found')
        error.statusCode = 401
        throw error
      }
      res.status(200).json({
        message: 'Status successfully retrieved',
        status: user.status
      })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500
      }
      next(err)
    })
}