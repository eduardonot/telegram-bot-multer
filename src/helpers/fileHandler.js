const path = require('path')
const fs = require('fs')
const oldFileFolder = path.resolve(__dirname, '..', '..', 'tmp', 'sending', 'old')
const newFileFolder = path.resolve(__dirname, '..', '..', 'tmp', 'sending', 'new', 'new-_file.jpeg')
module.exports = {
  oldFileFolder,
  newFileFolder,
  fileToUpload: () => {
    return fs.createReadStream(newFileFolder)
  },
  rename: (file, newFileFolder) => {
    return new Promise(function (resolve, reject) {
      fs.rename(file, newFileFolder, function (err) {
        if (err) reject(err)
        resolve()
      })
    })
  },
  delete: (file) => {
    return new Promise(function (resolve, reject) {
      fs.unlink(file, function (err) {
        if (err) reject(err)
        resolve()
      })
    })
  }
}
