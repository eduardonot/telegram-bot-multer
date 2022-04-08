const FormData = require('form-data')
const axios = require('axios')
const uploadURL = process.env.APP_UPLOAD_ROUTE
module.exports = {
  upload: async (chatId, messageId, fileToUpload) => {
    const formData = new FormData()
    formData.append('file', fileToUpload)
    formData.append('messageid', messageId)
    formData.append('chatid', chatId)
    await axios.post(uploadURL, formData, {
      headers: formData.getHeaders()
    })
  }
}
