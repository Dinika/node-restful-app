const expect = require('chai').expect
const sinon = require('sinon')
const User = require('../models/user')
const Auth = require('../controllers/auth')

describe('Auth-controller - Login', function () {
  it('should throw an error if accesssing db fails', function (done) {
    sinon.stub(User, 'findOne')
    User.findOne.rejects()

    const req = {
      body: {
        email: 'test@someemail.com',
        password: 'somepassword'
      }
    }
    Auth.login(req, {}, () => { })
      .then(result => {
        expect(result).to.be.an('error')
        expect(result).to.have.property('statusCode', 500)
        done()
      })
    User.findOne.restore()
  })
})