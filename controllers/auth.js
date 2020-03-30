const User = require('../models/user')
const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const jwtSignatureSecret = require('../secrets').jwtSignatureSecret

exports.signup = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed')
    error.statusCode = 422
    error.data = errors.array()
    throw error
  }
  const { email, name, password } = req.body
  bcrypt.hash(password, 12)
    .then(hassedPassword => {
      const user = new User({
        email,
        password: hassedPassword,
        name: name
      })
      return user.save()
    })
    .then(result => {
      res.status(201).json({ message: 'User created', userId: result._id })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500
      }
      next(err)
    })
}

exports.login = (req, res, next) => {
  const { email, password } = req.body
  let dbUser
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        const error = new Error('User with this email could not be found')
        error.statusCode = 401
        throw error
      }
      dbUser = user
      return bcrypt.compare(password, user.password)
    })
    .then(isEqual => {
      if (!isEqual) {
        const error = new Error('Incorrect password')
        error.statusCode = 401
        throw error
      }
      const token = jwt.sign({
        email: dbUser.email,
        userId: dbUser._id.toString()
      }, jwtSignatureSecret, {
        expiresIn: '1h'
      })
      res.status(200).json({
        token: token,
        userId: dbUser._id.toString()
      })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500
      }
      next(err)
    })
}