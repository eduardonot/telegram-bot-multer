const TelegramBot = require('node-telegram-bot-api')
const token = process.env.TELEGRAM_BOT_TOKEN
const bot = new TelegramBot(token, { polling: true })
const FormData = require('form-data')
const path = require('path')
const axios = require('axios').default
const fs = require('fs')

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, `Welcome, you can start sharing!
Type /upload to file format and sharing info.
Type /help if you want to know more about this bot.`)
})

bot.onText(/\/upload/, (msg) => {
  bot.sendMessage(msg.chat.id, `Send me a file to Upload!
Accepted file format:

🖼 - .jpeg
🖼 - .png
🖼 - .gif 
🎥 - .mp4
📚 - .zip
📚 - .rar

Important: Do not send multiple files. Only the one you will share!`)
})

bot.onText(/\/help/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Work in progress...')
})

bot.on('photo', async (msg) => {
  const oldFileFolder = path.resolve(__dirname, '..', '..', 'tmp', 'sending', 'old')
  const newFileFolder = path.resolve(__dirname, '..', '..', 'tmp', 'sending', 'new', 'new-_file.jpeg')
  const fileToUpload = fs.createReadStream(newFileFolder)
  const uploadURL = process.env.APP_UPLOAD_ROUTE
  const chatId = msg.chat.id
  let file
  if (msg.photo[0]) { file = msg.photo[0] }
  if (msg.photo[1]) { file = msg.photo[1] }
  if (msg.photo[2]) { file = msg.photo[2] }

  await bot.downloadFile(file.file_id, oldFileFolder)
    .then(async data => {
      fs.rename(data, newFileFolder, async function (err) {
        if (err) await bot.sendMessage(chatId, 'There was a problem during your request. Try again!')
      })
      const formData = new FormData()
      formData.append('file', fileToUpload)
      formData.append('messageid', msg.message_id)
      formData.append('chatid', chatId)
      await axios.post(uploadURL, formData, {
        headers: formData.getHeaders()
      })
    })
})
bot.on('video', (msg) => {
  const chatId = msg.chat.id
  bot.sendMessage(chatId, 'Recebi video!')
  console.log(msg)
})

bot.on('callback_query', (chatData) => {
  const data = JSON.parse(chatData.data)
  console.log(data)
  // TODO - Procurar arquivo no banco pelo hash e alterar os seguintes dados:
  // Sharing Type para data.type
  // uploadedby > userId
  
})

bot.on('message', (msg) => {
  // const inlineKeyboard = {
  //   inline_keyboard: [
  //     [{ text: 'Yes', callback_data: '1' }, { text: 'No', callback_data: '2' }]]
  // }
  // const chatId = msg.chat.id
  // bot.sendMessage(chatId, 'Welcome', {
  //   reply_to_message_id: msg.message_id,
  //   reply_markup: inlineKeyboard
  // })
})

module.exports = {
  uploadSucess: async (chatId, uploadedFileData, messageId) => {
    const parseData = JSON.parse(uploadedFileData)
    const inlineKeyboard = {
      inline_keyboard: [[
        { text: 'Free 📤', callback_data: JSON.stringify({ type: 'share', hash: parseData.hash }) },
        { text: 'Sell 💸', callback_data: JSON.stringify({ type: 'sell', hash: parseData.hash }) }
      ]]
    }
    await bot.sendMessage(chatId, 'Done!')
    await bot.sendMessage(chatId, 'Here is your file token. Remember: It can only be used once!')
    await bot.sendMessage(chatId, parseData.hash)
    await bot.sendMessage(chatId, 'Select a sharing method:', {
      reply_to_message_id: messageId,
      reply_markup: inlineKeyboard
    })
  },
  sendMessage: async (chatId, message) => {
    await bot.sendMessage(chatId, message)
  }
}
