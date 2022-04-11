const path = require('path')
const fs = require('fs')
const oldFileFolder = path.resolve(__dirname, '..', '..', 'tmp', 'sending', 'old')
module.exports = {
  oldFileFolder,
  newFileFolder: (originalFileName) => {
    return path.resolve(__dirname, '..', '..', 'tmp', 'sending', 'new', originalFileName)
  },
  fileToUpload: (originalFileName) => {
    return fs.createReadStream(path.resolve(__dirname, '..', '..', 'tmp', 'sending', 'new', originalFileName))
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
