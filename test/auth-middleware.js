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