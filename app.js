const express = require('express')
const feedRouter = require('./routes/feed')
const authRouter = require('./routes/auth')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const mongooseConnectionUri = require('./secrets').mongoConnectionUri
const path = require('path')
const multer = require('multer')
const userRouter = require('./routes/user')

const app = express()
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images')
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname)
  }
})
const fileFilter = (req, file, cb) => {
  const acceptedFormats = ['image/png', 'image/jpeg', 'image/jpg']
  if (acceptedFormats.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(null, false)
  }
}

app.use(bodyParser.json())
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'))
app.use('/images', express.static(path.join(__dirname, 'images')))

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  next()
})

app.use('/feed', feedRouter)
app.use('/auth', authRouter)
app.use('/user', userRouter)

app.use((error, req, res, next) => {
  console.log(error)
  const statusCode = error.statusCode || 500
  const message = error.message
  const data = error.data
  res.status(statusCode)
    .json({
      message,
      data
    })
})

mongoose
  .connect(mongooseConnectionUri)
  .then(result => {
    app.listen(8000)
  })
  .catch(err => {
    console.log(err)
  })