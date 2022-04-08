const FileService = require('./../services/FileService')
module.exports = {
  setSharingType: (hash, type, userId, sellingValue) => {
    return new Promise(function (resolve, reject) {
      FileService.findOneAndUpdate(hash, type, userId, sellingValue)
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
  }
}
