const User = require('../models/user')
const bcrypt = require('bcryptjs')
const validator = require('validator')

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
  }
}