const TelegramBot = require('node-telegram-bot-api')
const token = process.env.TELEGRAM_BOT_TOKEN
const bot = new TelegramBot(token, { polling: true })
const axios = require('axios').default
const FormData = require('form-data')

// bot.onText(/\/echo (.+)/, (msg, match) => {
//   const chatId = msg.chat.id
//   const resp = match[1]
//   bot.sendMessage(chatId, `${match}`)
// })
bot.on('photo', async (msg) => {
  const chatId = msg.chat.id
  bot.sendPhoto(chatId, msg.photo[0].file_id)
  console.log(msg.photo[0])
  // const formData = new FormData()
  // formData.append('file', msg.photo[0].file_id)
  // return axios.post(`http://${process.env.APP_HOST}:${process.env.APP_PORT}/upload`, formData, {
  //   headers: formData.getHeaders()
  // })
  // await bot.downloadFile(msg.photo[0].file_id, path.resolve(__dirname, '..', '..', 'tmp', 'pic'))
  //   .then(bot.sendPhoto(chatId, 'Downloaded!'))
})
bot.on('video', (msg) => {
  const chatId = msg.chat.id
  bot.sendMessage(chatId, 'Recebi video!' + msg)
})
