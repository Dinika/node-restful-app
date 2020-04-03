const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const mongooseConnectionUri = require('./secrets').mongoConnectionUri
const path = require('path')
const multer = require('multer')
const graphqlHttp = require('express-graphql')
const graphqlSchema = require('./graphql/schema')
const graphqlResolver = require('./graphql/resolver')
const auth = require('./middleware/auth')
const fs = require('fs')

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
  // The broswer sends an 'OPTION' request when it first tries
  // to communicate with our server. This request is automatically blocked
  // by express grapghql since it blocks any request with a header other than 'GET' and 'POST'
  // Therefore, we have to handle such an incoming OPTIONS request manually.
  if (req.method === 'OPTIONS') {
    // Just send an empty response
    res.status(200).send()
    return
  }
  next()
})


app.use(auth)

app.put('/post-image', (req, res, next) => {
  if (!req.isAuth) {
    throw new Error('Not authenticated')
  }
  if (!req.file) {
    return res.status(200).json({
      message: 'No image provided'
    })
  }
  if (req.body.oldPath) {
    clearImage(req.body.oldPath)
  }
  return res.status(201).json({
    message: 'File stored',
    filePath: req.file.path
  })
})


app.use('/graphql', graphqlHttp({
  schema: graphqlSchema,
  rootValue: graphqlResolver,
  graphiql: true,
  formatError(err) {
    if (!err.originalError) {
      return err
    }
    const data = err.originalError.data
    const message = err.message || 'An error occured when processing the request'
    const code = err.originalError.code
    return {
      message,
      data,
      status: code
    }
  }
}))

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
const clearImage = (filePath) => {
  filePath = path.join(__dirname, '..', filePath)
  fs.unlink(filePath, err => {
    console.log(err)
  })
}

mongoose
  .connect(mongooseConnectionUri)
  .then(result => {
    app.listen(8000)
  })
  .catch(err => {
    console.log(err)
  })