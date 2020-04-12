const expect = require('chai').expect
const auth = require('../middleware/auth')
const jwt = require('jsonwebtoken')
const sinon = require('sinon')

describe('Auth middleware', function () {
  it('should set isAuth to false if req has no Authorization header', function () {
    const req = {
      get: function () {
        return null
      }
    }
    auth(req, {}, () => { })
    expect(req.isAuth).to.equal(false)
  })

  it('should set isAuth to false if req has Authorization header specified if wrong format', function () {
    const req = {
      get: function () {
        return 'xyz'
      }
    }
    auth(req, {}, () => { })
    expect(req.isAuth).to.equal(false)
  })

  it('should add userId to request if request has valid token', function () {
    const req = {
      get: function (header) {
        return 'Bearer xyz'
      }
    }
    sinon.stub(jwt, 'verify')
    jwt.verify.returns({ userId: 'abc' })
    auth(req, {}, () => { })
    expect(req).to.have.property('userId')
    expect(req.userId).to.equal('abc')
    expect(jwt.verify.called).to.be.true
    jwt.verify.restore()
  })
})
