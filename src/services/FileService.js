const Files = require('./../models/Files')
module.exports = {
  findOneAndUpdate: async (hash, type, userId, sellingValue) => {
    await Files.findOneAndUpdate({ hash }, {
      $set: {
        uploadedBy: userId,
        sharingType: type,
        sellingValue
      }
    })
  },
  getFile: async (hash) => {
    return new Promise(function(resolve, reject) {
      Files.find({ hash })
        .then(data => resolve(data))
        .catch(err => reject(err))
    })
  }
}
