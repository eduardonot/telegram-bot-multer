const express = require('express')
const morgan = require('morgan')
require('./telegramBot')
const db = require('./mongoose')
const app = express()
const port = process.env.APP_PORT

module.exports = {
  start: () => {
    db.connect()
    app.listen(port, () => console.log(`Running on port ${port}`))
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
    app.use(require('./../routes'))
    app.use(morgan('dev'))
  }
}
