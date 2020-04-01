const User = require('../models/user')
const bcrypt = require('bcryptjs')

module.exports = {
  createUser: async function ({ userAuthData }, req) {
    const { email, name, password } = userAuthData
    console.log("HERE", email, name, password)
    const existingUser = await User.findOne({ email: email })
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