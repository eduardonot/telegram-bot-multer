const routes = require('express').Router()
const multer = require('multer')
const multerConfig = require('./config/multerConfig')
const Files = require('./models/Files')

routes.post('/upload', multer(multerConfig).single('file'), async (req, res) => {
  const { originalname: name, key, hash, size, location: url = '' } = req.file
  const sendFile = await Files.create({
    name,
    size,
    key,
    hash,
    url
  })
  res.send(sendFile)
})

routes.get('/', (req, res) => res.send('oi'))

module.exports = routes
