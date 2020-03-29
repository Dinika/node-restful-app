const express = require('express')
const feedRouter = require('./routes/feed')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const mongooseConnectionUri = require('./secrets').mongoConnectionUri

const app = express()
app.use(bodyParser.json())
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  next()
})

app.use('/feed', feedRouter)

mongoose
  .connect(mongooseConnectionUri)
  .then(result => {
    app.listen(8000)
  })
  .catch(err => {
    console.log(err)
  })