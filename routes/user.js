const express = require('express')
const statusController = require('../controllers/user')
const isAuth = require('../middleware/isAuth')

const router = express.Router()

router.get('/status', isAuth, statusController.getStatus)

module.exports = router