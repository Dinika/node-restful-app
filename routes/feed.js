const express = require('express')
const feedControllder = require('../controllers/feed')
const router = express.Router()

router.get('/posts', feedControllder.getPosts)

module.exports = router