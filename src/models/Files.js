const mongoose = require('mongoose')
const aws = require('aws-sdk')
const s3 = new aws.S3()

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
    sellingValue: {
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
FileSchema.pre('remove', function () {
  return s3.deleteObject({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: this.key
  }).promise()
})
module.exports = mongoose.model('Files', FileSchema)
