const mongoose = require('mongoose')
const FileSchema = mongoose.Schema(
  {
    name: {
      type: String
    },
    size: {
      type: Number
    },
    key: {
      type: String
    },
    hash: {
      type: String
    },
    url: {
      type: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
)
module.exports = mongoose.model('Files', FileSchema)
