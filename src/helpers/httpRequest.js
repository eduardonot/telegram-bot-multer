const FormData = require('form-data')
const axios = require('axios').default
const uploadURL = process.env.APP_UPLOAD_ROUTE
const deleteURL = process.env.APP_DELETE_ROUTE
module.exports = {
  upload: (chatId, messageId, fileToUpload) => {
    return new Promise(function (resolve, reject) {
      const formData = new FormData()
      formData.append('file', fileToUpload)
      formData.append('messageid', messageId)
      formData.append('chatid', chatId)
      const submit = axios.post(uploadURL, formData, {
        headers: formData.getHeaders()
      })
        .then((data) => {
          if (data.status === 201) {
            resolve(data.status)
          } else {
            reject(data.status)
          }
        })
        .catch(() => {
          return submit
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
        .catch(() => {
          return submit
        })
    })
  }
}
