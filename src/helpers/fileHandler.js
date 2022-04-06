const path = require('path')
const fs = require('fs')
const oldFileFolder = path.resolve(__dirname, '..', '..', 'tmp', 'sending', 'old')
const newFileFolder = path.resolve(__dirname, '..', '..', 'tmp', 'sending', 'new', 'new-_file.jpeg')
const fileToUpload = fs.createReadStream(newFileFolder)
module.exports = {
  oldFileFolder,
  newFileFolder,
  fileToUpload,
  rename: (file, newFileFolder) => {
    return new Promise(function (resolve, reject) {
      fs.rename(file, newFileFolder, function (err) {
        if (err) reject(err)
        resolve()
      })
    })
  }
}
