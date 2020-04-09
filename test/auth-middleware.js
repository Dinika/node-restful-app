const expect = require('chai').expect
const auth = require('../middleware/auth')

it('should throw an error if an authorization header is present', function () {
  const req = {
    get: function () {
      return null
    }
  }

  expect(auth.bind(this, req, {}, () => { })).to.throw('Not authenticated')
})

it('should throw an error id auth header does not contain auth key', function () {
  const req = {
    get: function () {
      return 'xyz'
    }
  }

  expect(auth.bind(this, req, {}, () => { })).to.throw()
})