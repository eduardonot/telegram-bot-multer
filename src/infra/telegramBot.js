const TelegramBot = require('node-telegram-bot-api')
const token = process.env.TELEGRAM_BOT_TOKEN
const bot = new TelegramBot(token, { polling: true })
const FileController = require('./../controller/Files')
const fileHandler = require('./../helpers/fileHandler')
const httpRequest = require('../helpers/httpRequest')
const Files = require('./../controller/Files')

// CONVERT NUMERIC SIZE TO SIZE NAME
function formatBytes (bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

async function sendDownloadInline (chatId, file, messageId) {
  const fileSize = formatBytes(file.size)
  const inlineKeyboard = {
    inline_keyboard: [[
      { text: 'Download', callback_data: JSON.stringify({ type: 'download', hash: file.hash }) },
      { text: 'Cancel', callback_data: JSON.stringify({ type: 'cancel' }) }
    ]]
  }
  return await bot.sendMessage(chatId, `File Found!\n\nYou're about to download the following file:\nFile Name: ${file.name}\nSize: ${fileSize}\n\nSelect:`, {
    reply_to_message_id: messageId,
    reply_markup: inlineKeyboard
  })
}

bot.onText(/\/start/, (msg) => {
  if (msg.text === '/start') {
    bot.sendMessage(msg.chat.id, `Welcome, you can start sharing!
Type /upload to file format and sharing info.
Type /help if you want to know more about this bot.`)
  }
})

bot.onText(/\/getfile/, (msg) => {
  if (msg.text === '/getfile') bot.sendMessage(msg.chat.id, 'To download your file, just type /getfile [hash] without the brackets.')
})

// GET USER "/getfile <hash>" INPUT OR USE SHARING URL
bot.onText(/\/start (.+)|\/getfile (.+)/, async (msg, match) => {
  const chatId = msg.chat.id
  const resp = match[1] || match[2]

  // RETURN FILE FROM DATABASE
  await Files.getFile(resp)
    .then(async (data) => {
      if (data.length > 0) {
        const file = data[0]
        // FREE SHARING OPTION
        if (file.sharingType === 'share') {
          await sendDownloadInline(chatId, file, msg.message_id)
        }
      } else {
        await bot.sendMessage(chatId, 'This hash is Invalid or Expired')
      }
    })
    .catch(async (err) => {
      console.log(err)
      await bot.sendMessage(chatId, 'Problem with your request. Try Again!')
    })
})

bot.onText(/\/upload/, (msg) => {
  bot.sendMessage(msg.chat.id, `Send me a file to Upload!
Available file format:

🖼 .jpeg
🖼 .png
📝 .pdf   
🎥 .mp4
📚 .zip`)
})

bot.onText(/\/help/, (msg) => {
  bot.sendMessage(msg.chat.id, `Upload a file and share it once. After the first download, it will be permanently deleted!

Info ℹ
Max File Size: 2gb
File Lifetime: 4 hours before deletion

Commands 🕹
/upload - Check available file format to upload.
/getfile - Hint about download manually.

This bot doen't store any user data. If Telegram does it, this has nothing to do with us.`)
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
  const video = msg.video
  bot.downloadFile(video.file_id, fileHandler.oldFileFolder)
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
  await bot.answerCallbackQuery(chatData.id)
    .then(async () => await bot.deleteMessage(chatData.message.chat.id, chatData.message.message_id))
  switch (data.type) {
    case 'share':
      FileController.setSharingType(data.hash, data.type, chatData.from.id, 0, 'Default File Name')
        .then(async (hash) => await bot.sendMessage(chatId, 'With the hash below, the file can be downloaded once. Share carefully.')
          .then(async () => await bot.sendMessage(chatId, hash))
          .then(async () => await bot.sendMessage(chatId, 'If you prefer share this file as an URL, here is the link:'))
          .then(async () => await bot.sendMessage(chatId, `https://t.me/HiddenShare_bot?start=${hash}`)))
        .catch(async () => await bot.sendMessage(chatId, 'Could not generate your share hash. Try again!'))
      break
    case 'up_cancel':
      Files.deleteFile(data.hash)
        .then(() => {
          bot.sendMessage(chatId, 'Canceled!')
        })
        .catch(err => console.log(err))
      break
    case 'download':
      await Files.getFile(data.hash)
        .then(async (data) => {
          const file = data[0]
          if (file.uploadCategory === 'photo') await bot.sendPhoto(chatId, file.url)
          if (file.uploadCategory === 'document') await bot.sendDocument(chatId, file.url)
          if (file.uploadCategory === 'video') await bot.sendVideo(chatId, file.url)
          Files.deleteFile(file.hash)
            .then(resp => {
              if (chatId !== resp.data.uploadedBy) {
                bot.sendMessage(resp.data.uploadedBy, `The file you shared has been downloaded\nFile Hash: ${file.hash}`)
              }
              bot.sendMessage(chatId, `Here is your file. You can't download it again.\nHash Used: ${file.hash}`)
            })
            .catch(err => console.log(err))
        })
      break
    case 'cancel':
      await bot.sendMessage(chatId, 'Canceled!')
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
        { text: 'Share ✅', callback_data: JSON.stringify({ type: 'share', hash: parseData.hash }) },
        { text: 'Cancel ❌', callback_data: JSON.stringify({ type: 'up_cancel', hash: parseData.hash }) }
      ]]
    }
    await bot.sendMessage(chatId, 'Your file is ready to be shared.\nWhat you wanna do:', {
      reply_to_message_id: messageId,
      reply_markup: inlineKeyboard
    })
  },
  sendMessage: async (chatId, message) => {
    await bot.sendMessage(chatId, message)
  }
}
