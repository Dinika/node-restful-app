const express = require('express')
const feedControllder = require('../controllers/feed')
const router = express.Router()
const { body } = require('express-validator/check')

router.get('/posts', feedControllder.getPosts)
router.post('/post',
  [
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 })
  ],
  feedControllder.createPost
)

module.exports = router