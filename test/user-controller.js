const expect = require('chai').expect
const User = require('../models/user')
const mongoose = require('mongoose')
const testDbConnectionUri = require('../secrets').testDbConnectionUri
const userController = require('../controllers/user')

describe('User controller', function () {
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

  it('should send correct status when user retrieves their status', function (done) {


    const req = { userId: '5e87d8cc93d7ef3b088ac67e' }
    const res = {
      statusCode: 500,
      userStatus: null,
      status: function (code) {
        this.statusCode = code
        return this
      },
      json: function (data) {
        this.userStatus = data.status
      }
    }

    userController.getStatus(req, res, () => { })
      .then(() => {
        expect(res.statusCode).to.equal(200)
        expect(res.userStatus).to.be.equal('New user')
        done()
      })
  })
})