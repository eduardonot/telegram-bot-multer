const FormData = require('form-data')
module.exports = {
  upload: (chatId, fileToUpload) => {
    return new Promise(function (resolve, reject) {
      const formData = new FormData()
      formData.append('file', fileToUpload)
      formData.append('chatid', chatId)
      formData.submit('http://localhost:3000/upload', function (err, res) {
        err ? reject(err) : resolve()
      })
    })
  }
}
