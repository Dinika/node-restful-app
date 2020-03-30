const User = require('../models/user')
const { validationResult } = require('express-validator')

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

exports.updateStatus = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect')
    error.statusCode = 422
    throw error
  }

  const userId = req.userId
  if (!userId) {
    const authError = new Error('Not authenticated')
    authError.statusCode = 401
    throw authError
  }

  User.findById(userId)
    .then(user => {
      user.status = req.body.status
      return user.save()
    })
    .then(result => {
      res.status(201).json({
        message: 'Status successfully updated'
      })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500
      }
      next(err)
    })
}