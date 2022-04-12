const routes = require('express').Router()
const multer = require('multer')
const multerConfig = require('./config/multerConfig')
const Files = require('./models/Files')
const telegram = require('./infra/telegramBot')

routes.post('/upload', multer(multerConfig).single('file'), async (req, res) => {
  const fourHours = 4 * 60 * 60 * 1000
  const date = new Date()
  const sumDate = date.getTime() + fourHours
  const { originalname: name, key, hash, size, location: url = '' } = req.file
  const sendFile = await Files.create({
    name,
    size,
    key,
    hash,
    url,
    autoDeleteDate: new Date(sumDate),
    uploadCategory: req.body.category,
    sharingType: 'none',
    sellingValue: 0
  })
  telegram.uploadSucess(req.body.chatid, JSON.stringify(sendFile), req.body.messageid)
  res.status(201).send('Created')
})

routes.delete('/delete', async (req, res) => {
  const fileHash = req.body.hash
  const getFile = await Files.findOne({ hash: fileHash })
  await getFile.remove()
  res.status(200).send(getFile)
})

module.exports = routes
