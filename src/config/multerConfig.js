const multerS3 = require('multer-s3')
const aws = require('aws-sdk')
const path = require('path')
const crypto = require('crypto')

const storageTypes = {
  s3: multerS3({
    s3: new aws.S3(),
    bucket: process.env.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read',
    key: (req, file, cb) => {
      crypto.randomBytes(16, (err, hash) => {
        if (err) cb(err)
        const stringHash = `${hash.toString('hex')}`
        file.hash = stringHash
        const fileName = `${hash.toString('hex')}-${file.originalname}`
        cb(null, fileName)
      })
    }
  })
}

module.exports = {
  dest: path.resolve(__dirname, '..', '..', 'tmp', 'sending'),
  storage: storageTypes.s3,
  limits: {
    fileSize: process.env.MAX_FILESIZE
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/pjpeg',
      'image/png',
      'video/mp4',
      'application/zip',
      'application/pdf'
    ]

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type'))
    }
  }
}
