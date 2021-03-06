const Files = require('./../models/Files')
module.exports = {
  findOneAndUpdate: async (hash, type, userId, sellingValue, originalFileName) => {
    await Files.findOneAndUpdate({ hash }, {
      $set: {
        uploadedBy: userId,
        sharingType: type,
        sellingValue,
        originalFileName: originalFileName || 'MyFile'
      }
    })
  },
  getFile: async (hash) => {
    return new Promise(function (resolve, reject) {
      Files.find({ hash })
        .then(data => resolve(data))
        .catch(err => reject(err))
    })
  },
  deleteOne: async (hash) => {
    return new Promise(function (resolve, reject) {
      Files.findOneAndDelete({ hash: hash })
        .then(data => resolve(data))
        .catch(err => (err))
    })
  }
}
