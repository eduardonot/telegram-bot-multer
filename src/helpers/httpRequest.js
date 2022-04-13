const FormData = require('form-data')
const axios = require('axios').default
const telegramBot = require('./../infra/telegramBot')
const uploadURL = process.env.APP_UPLOAD_ROUTE
const deleteURL = process.env.APP_DELETE_ROUTE

module.exports = {
  reportUploadPercent: (number) => {
    console.log(number)
  },
  upload: (chatId, messageId, fileToUpload, originalFilename, category) => {
    return new Promise(function (resolve, reject) {
      const formData = new FormData()
      formData.append('file', fileToUpload)
      formData.append('filename', originalFilename)
      formData.append('category', category)
      formData.append('messageid', messageId)
      formData.append('chatid', chatId)
      axios.post(uploadURL, formData, {
        headers: formData.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          this.reportUploadPercent(percentCompleted)
        }
      })
        .then((data) => {
          if (data.status === 201) {
            resolve(data.status)
          } else {
            reject(data.status)
          }
        })
        .catch((err) => {
          reject(err)
        })
    })
  },
  delete: (fileHash) => {
    return new Promise(function (resolve, reject) {
      const submit = axios.delete(deleteURL, {
        data: {
          hash: fileHash
        }
      })
        .then((data) => {
          if (data.status === 200) {
            resolve(data)
          } else {
            reject(data.status)
          }
        })
        .catch((err) => {
          console.log(err)
          reject(err)
        })
        .catch(() => { return submit })
    })
  }
}
