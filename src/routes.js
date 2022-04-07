const routes = require('express').Router()
const multer = require('multer')
const multerConfig = require('./config/multerConfig')
const Files = require('./models/Files')
const telegram = require('./infra/telegramBot')

routes.post('/upload', multer(multerConfig).single('file'), async (req, res) => {
  const { originalname: name, key, hash, size, location: url = '' } = req.file
  const sendFile = await Files.create({
    name,
    size,
    key,
    hash,
    url
  })
  telegram.uploadSucess(req.body.chatid, JSON.stringify(sendFile), req.body.messageid)
  res.send('Done')
})

routes.get('/', (req, res) => res.send('oi'))

module.exports = routes
