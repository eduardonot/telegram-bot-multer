const FileService = require('./../services/FileService')
const httpRequest = require('./../helpers/httpRequest')
module.exports = {
  setSharingType: (hash, type, userId, sellingValue, originalFileName) => {
    return new Promise(function (resolve, reject) {
      FileService.findOneAndUpdate(hash, type, userId, sellingValue, originalFileName)
        .then(() => resolve(hash))
        .catch((err) => reject(err))
    })
  },
  getFile: (hash) => {
    return new Promise(function (resolve, reject) {
      FileService.getFile(hash)
        .then(data => resolve(data))
        .catch(err => reject(err))
    })
  },
  deleteFile: (hash) => {
    return new Promise(function (resolve, reject) {
      httpRequest.delete(hash)
        .then(data => resolve(data))
        .catch(err => reject(err))
    })
  }
}
