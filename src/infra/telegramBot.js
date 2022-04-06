const TelegramBot = require('node-telegram-bot-api')
const token = process.env.TELEGRAM_BOT_TOKEN
const bot = new TelegramBot(token, { polling: true })
const FormData = require('form-data')
const path = require('path')
const fs = require('fs')

// bot.onText(/\/echo (.+)/, (msg, match) => {
//   const chatId = msg.chat.id
//   const resp = match[1]
//   bot.sendMessage(chatId, `${match}`)
// })
bot.on('photo', async (msg) => {
  const oldFileFolder = path.resolve(__dirname, '..', '..', 'tmp', 'sending', 'old')
  const newFileFolder = path.resolve(__dirname, '..', '..', 'tmp', 'sending', 'new', 'new-_file.jpeg')
  const fileToUpload = fs.createReadStream(newFileFolder)
  const chatId = msg.chat.id
  let file
  if (msg.photo[0]) { file = msg.photo[0] }
  if (msg.photo[1]) { file = msg.photo[1] }
  if (msg.photo[2]) { file = msg.photo[2] }

  await bot.downloadFile(file.file_id, oldFileFolder)
    .then(async data => {
      fs.rename(data, newFileFolder, async function (err) {
        if (err) await bot.sendMessage(chatId, 'Nao foi possivel realizar sua requisição.')
      })
      const formData = new FormData()
      formData.append('file', fileToUpload)
      formData.append('chatid', chatId)
      formData.submit('http://localhost:3000/upload', function (err, res) {
        if (err) bot.sendMessage(chatId, 'Falha no Upload, tente novamente!')
      })
    })
})
bot.on('video', (msg) => {
  const chatId = msg.chat.id
  bot.sendMessage(chatId, 'Recebi video!' + msg)
})

module.exports = {
  sendReport: async (chatId, data) => {
    const parseData = JSON.parse(data)
    // await bot.sendMessage(chatId, `File Size: ${parseData.size / 1024 / 1024}mb`)
    await bot.sendMessage(chatId, parseData.hash)
  },
  sendMessage: async (chatId, message) => {
    bot.sendMessage(chatId, message)
  }
}
