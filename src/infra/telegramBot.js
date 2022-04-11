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

// GET USER "/getfile <hash>" INPUT OR USE SHARING URL
bot.onText(/\/start (.+)|\/getfile (.+)/, async (msg, match) => {
  const chatId = msg.chat.id
  const resp = match[1] || match[2]
  await Files.getFile(resp)
  // RETURN FILE FROM DATABASE
    .then(async (data) => {
      if (data.length > 0) {
        await bot.sendMessage(chatId, 'Wait a moment...')
        // FREE SHARING OPTION
        if (data[0].sharingType === 'share') {
          if (data[0].uploadCategory === 'photo') await bot.sendPhoto(chatId, data[0].url)
          if (data[0].uploadCategory === 'document') await bot.sendDocument(chatId, data[0].url)
          if (data[0].uploadCategory === 'video') await bot.sendVideo(chatId, data[0].url)
          Files.deleteFile(data[0].hash)
            .then(resp => {
              if (chatId !== resp.data.uploadedBy) {
                bot.sendMessage(resp.data.uploadedBy, `The file you shared has been downloaded\nFile Hash: ${data[0].hash}`)
              }
              bot.sendMessage(chatId, `Here is your file. You can't download it again.\nHash Used: ${data[0].hash}`)
            })
        }
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

🖼 .jpeg
🖼 .png
📝 .pdf   
🎥 .mp4
📚 .zip

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
    .then(oldFolder => {
      const originalFilename = oldFolder.split('/').pop()
      fileHandler.rename(oldFolder, fileHandler.newFileFolder(originalFilename))
        .then(() => {
          httpRequest.upload(chatId, msg.message_id, fileHandler.fileToUpload(originalFilename), originalFilename, 'photo')
            .then(async (data) => {
              await fileHandler.delete(fileHandler.newFileFolder(originalFilename))
              return data
            })
            .catch(async () => bot.sendMessage(chatId, 'Upload Problem. Try again!'))
        })
        .catch(async () => await bot.sendMessage(chatId, 'Upload Problem. Try again or type /upload to check allowed upload file format.'))
    })
})
bot.on('video', (msg) => {
  const chatId = msg.chat.id
  bot.sendMessage(chatId, 'Recebi video!')
  console.log(msg)
})

bot.on('document', (msg) => {
  const chatId = msg.chat.id
  const document = msg.document
  bot.downloadFile(document.file_id, fileHandler.oldFileFolder)
    .then(oldFolder => {
      const originalFilename = oldFolder.split('/').pop()
      fileHandler.rename(oldFolder, fileHandler.newFileFolder(originalFilename))
        .then(() => {
          httpRequest.upload(chatId, msg.message_id, fileHandler.fileToUpload(originalFilename), originalFilename, 'document')
            .then(async (data) => {
              await fileHandler.delete(fileHandler.newFileFolder(originalFilename))
              return data
            })
            .catch(async () => bot.sendMessage(chatId, 'Upload Problem. Try again!'))
        })
        .catch(async () => await bot.sendMessage(chatId, 'Upload Problem. Try again or type /upload to check allowed upload file format.'))
    })
})

bot.on('callback_query', async (chatData) => {
  const chatId = chatData.message.chat.id
  const data = JSON.parse(chatData.data)
  switch (data.type) {
    case 'share':
      await bot.answerCallbackQuery(chatData.id)
        .then(async () => await bot.deleteMessage(chatData.message.chat.id, chatData.message.message_id))
      FileController.setSharingType(data.hash, data.type, chatData.from.id, 0, 'Default File Name')
        .then(async (hash) => await bot.sendMessage(chatId, 'With the hash below, the file can be downloaded once. Share carefully.')
          .then(async () => await bot.sendMessage(chatId, hash))
          .then(async () => await bot.sendMessage(chatId, `If you prefer share this file as an URL, here is the link:\nhttps://t.me/HiddenShare_bot?start=${hash}`)))
        .catch(async () => await bot.sendMessage(chatId, 'Could not generate your share hash. Try again!'))
      break
    case 'sell':
      await bot.sendMessage(chatId, 'Not working yet')
      await bot.answerCallbackQuery(chatData.id)
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
    await bot.sendMessage(chatId, 'Select a sharing method:', {
      reply_to_message_id: messageId,
      reply_markup: inlineKeyboard
    })
  },
  sendMessage: async (chatId, message) => {
    await bot.sendMessage(chatId, message)
  }
}
