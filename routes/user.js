const express = require('express')
const userController = require('../controllers/user')
const isAuth = require('../middleware/isAuth')
const { body } = require('express-validator')

const router = express.Router()

router.get('/status', isAuth, userController.getStatus)
router.post('/status', isAuth, [
  body('status').trim().isLength({ min: 2 }).withMessage('Status should be atleast 2 characters long')
], userController.updateStatus)

module.exports = router