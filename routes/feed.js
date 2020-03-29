const express = require('express')
const feedControllder = require('../controllers/feed')
const router = express.Router()

router.get('/posts', feedControllder.getPosts)
router.post('/post', feedControllder.createPosts)

module.exports = router