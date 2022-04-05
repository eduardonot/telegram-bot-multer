const routes = require('express').Router()
const multer = require('multer')
const multerConfig = require('./config/multerConfig')

routes.post('/upload', multer(multerConfig).single('file'), (req, res) => {
  res.send('foi')
})

routes.get('/', (req, res) => res.send('oi'))

module.exports = routes
