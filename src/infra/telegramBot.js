const TelegramBot = require('node-telegram-bot-api')
const token = process.env.TELEGRAM_BOT_TOKEN
const bot = new TelegramBot(token, { polling: true })
const FileController = require('./../controller/Files')
const fileHandler = require('./../helpers/fileHandler')
const httpRequest = require('../helpers/httpRequest')
const Files = require('./../controller/Files')

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, `Welcome, you can start sharing!
Type /upload to file format and sharing info.
Type /help if you want to know more about this bot.`)
})

bot.onText(/\/getfile/, (msg) => {
  if (msg.text === '/getfile') bot.sendMessage(msg.chat.id, 'To download your file, just type /getfile [hash] without the brackets.')
})

bot.onText(/\/getfile (.+)/, async (msg, match) => {
  const chatId = msg.chat.id
  const resp = match[1]
  await Files.getFile(resp)
    .then(async (data) => {
      if (data.length > 0) {
        await bot.sendMessage(chatId, 'Wait a moment...')
        await bot.sendPhoto(chatId, data[0].url)
        Files.deleteFile(data[0].hash)
          .then(resp => {
            if (chatId !== resp.data.uploadedBy) {
              bot.sendMessage(resp.data.uploadedBy, `The file you shared has been downloaded\nFile Hash: ${data[0].hash}`)
            }
            bot.sendMessage(chatId, `Here is your file. You can't download it again.\nFile Hash: ${data[0].hash}`)
          })
      } else {
        await bot.sendMessage(chatId, 'This hash is Invalid or Expired')
      }
    })
    .catch(async () => {
      await bot.sendMessage(chatId, 'Problem with your request. Try Again!')
    })
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
  const chatId = msg.chat.id
  let file
  if (msg.photo[0]) { file = msg.photo[0] }
  if (msg.photo[1]) { file = msg.photo[1] }
  if (msg.photo[2]) { file = msg.photo[2] }
  bot.downloadFile(file.file_id, fileHandler.oldFileFolder)
    .then(data => {
      fileHandler.rename(data, fileHandler.newFileFolder)
        .then(() => {
          httpRequest.upload(chatId, msg.message_id, fileHandler.fileToUpload())
            .then(async (data) => {
              await fileHandler.delete(fileHandler.newFileFolder)
              return data
            })
            .catch(async () => bot.sendMessage(chatId, 'Upload Problem. Try again!'))
        })
        .catch(async () => await bot.sendMessage(chatId, 'There was a problem during your request. Try again!'))
    })
})
bot.on('video', (msg) => {
  const chatId = msg.chat.id
  bot.sendMessage(chatId, 'Recebi video!')
  console.log(msg)
})

bot.on('callback_query', async (chatData) => {
  const chatId = chatData.message.chat.id
  const data = JSON.parse(chatData.data)
  switch (data.type) {
    case 'share':
      await bot.answerCallbackQuery(chatData.id)
        .then(async () => await bot.deleteMessage(chatData.message.chat.id, chatData.message.message_id))
      FileController.setSharingType(data.hash, data.type, chatData.from.id, 0)
        .then(async (hash) => await bot.sendMessage(chatId, 'Here is your Sharing Hash. Remember: It can be only used once!\nIf you want to know how to download the file, type: /getfile')
          .then(async () => await bot.sendMessage(chatId, hash)))
        .catch(async () => await bot.sendMessage(chatId, 'Could not generate your share hash. Try again!'))
      break
    case 'sell':
      await bot.sendMessage(chatId, 'Not working yet')
      await bot.answerCallbackQuery(chatData.id)
      // FileController.setSharingType(data.hash, data.type, chatData.from.id, 1)
      //   .then(async (hash) => await bot.sendMessage(chatId, 'Here is your Selling Hash. Remember: It can be only used once!\nIf you want to know how to download the file, type: /getfile')
      //     .then(async () => await bot.sendMessage(chatId, hash)))
      //   .catch(async () => await bot.sendMessage(chatId, 'Could not generate your share hash. Try again!'))
      break
  }
})

bot.on('message', (msg) => {
  // NOTHING YET
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
    await bot.sendMessage(chatId, 'Select a sharing method:', {
      reply_to_message_id: messageId,
      reply_markup: inlineKeyboard
    })
  },
  sendMessage: async (chatId, message) => {
    await bot.sendMessage(chatId, message)
  }
}
