const expect = require('chai').expect
const Post = require('../models/post')
const User = require('../models/user')
const mongoose = require('mongoose')
const testDbConnectionUri = require('../secrets').testDbConnectionUri
const feedController = require('../controllers/feed')

describe('Feed controller', function () {
  before(function (done) {
    mongoose
      .connect(testDbConnectionUri)
      .then(result => {
        const user = new User({
          email: 'david@dcaro.es',
          password: 'davidDavid',
          name: 'David',
          posts: [],
          _id: '5e87d8cc93d7ef3b088ac67e'
        })
        return user.save()
      })
      .then(() => {
        done()
      })
  })

  after(function (done) {
    User.deleteMany({})
      .then(() => {
        return mongoose.disconnect()
      })
      .then(() => {
        done()
      })
  })

  it('should create a post successfully', function (done) {
    const req = {
      userId: '5e87d8cc93d7ef3b088ac67e',
      body: {
        title: 'Test post',
        content: 'Test content',

      },
      file: {
        path: 'Test file path'
      }
    }
    const res = {
      statusCode: 500,
      userStatus: null,
      status: function () {
        return this
      },
      json: function () { }
    }

    feedController.createPost(req, res, () => { })
      .then(() => {
        return User.findById('5e87d8cc93d7ef3b088ac67e')
      })
      .then((user) => {
        expect(user).to.have.property('posts')
        expect(user.posts).to.have.length(1)
        done()
      })
  })
})