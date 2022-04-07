const mongoose = require('mongoose')
const FileSchema = mongoose.Schema(
  {
    uploadedBy: {
      type: Number
    },
    originalFilename: {
      type: String
    },
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
    sharingType: {
      type: String
    },
    selling_value: {
      type: Number
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    autoDeleteDate: {
      type: Date
    }
  }
)
module.exports = mongoose.model('Files', FileSchema)
