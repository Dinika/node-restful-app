const jwt = require('jsonwebtoken')
const jwtSignatureSecret = require('../secrets').jwtSignatureSecret

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization')
  if (!authHeader) {
    req.isAuth = false
    next()
    return
  }
  const token = authHeader.split(' ')[1]
  let decodedToken
  try {
    decodedToken = jwt.verify(token, jwtSignatureSecret)
  } catch (err) {
    req.isAuth = false
    next()
    return
  }
  if (!decodedToken) {
    req.isAuth = false
    next()
    return
  }
  req.userId = decodedToken.userId
  req.isAuth = true
  next()
}