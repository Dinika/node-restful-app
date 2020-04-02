const User = require('../models/user')
const Post = require('../models/post')
const bcrypt = require('bcryptjs')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const jwtSignKey = require('../secrets').jwtSignatureSecret

module.exports = {
  createUser: async function ({ userAuthData }, req) {
    const { email, name, password } = userAuthData
    const existingUser = await User.findOne({ email: email })
    const errors = []
    if (!validator.isEmail(email)) {
      errors.push({
        message: 'Email is invalid',
      })
    }
    if (validator.isEmpty(password) || !validator.isLength(password, { min: 5 })) {
      errors.push({
        message: 'Password is too short'
      })
    }
    if (errors.length > 0) {
      const error = new Error('Invalid input')
      error.data = errors
      error.code = 422
      throw error
    }
    if (existingUser) {
      const error = new Error('User already exisits')
      throw error
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = new User({
      email: email,
      name: name,
      password: hashedPassword
    })
    const createdUser = await user.save()
    return { ...createdUser._doc, _id: createdUser._id.toString() }
  },

  login: async function ({ email, password }) {
    const user = await User.findOne({ email: email })
    if (!user) {
      const error = new Error('User not found')
      error.code = 401
      throw error
    }
    const isEqual = await bcrypt.compare(password, user.password)
    if (!isEqual) {
      const error = new Error('Password is incorrect')
      error.code = 401
      throw error
    }
    const token = jwt.sign({
      userId: user._id.toString(),
      email: user.email
    },
      jwtSignKey,
      { expiresIn: '1h' })
    return { token, userId: user._id.toString() }
  },

  createPost: async function ({ postInput }, req) {
    const errors = []
    if (validator.isEmpty(postInput.title) || !validator.isLength(postInput.title, { min: 3 })) {
      errors.push({ message: 'Title is too short' })
    }
    if (validator.isEmpty(postInput.content) || !validator.isLength(postInput.content, { min: 5 })) {
      errors.push({ message: 'Content is too short' })
    }
    if (errors.length > 1) {
      const error = new Error('Invalid input')
      error.data = errors
      error.code = 422
      throw error
    }
    const post = new Post({
      title: postInput.title,
      content: postInput.content,
      imageUrl: postInput.imageUrl
    })
    const createdPost = await post.save()
    return {
      ...createdPost._doc,
      _id: createdPost._id.toString(),
      createdAt: createdPost.createdAt.toISOString(),
      updatedAt: createdPost.updatedAt.toISOString()
    }
  }
}
