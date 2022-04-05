const multer = require('multer')
const multerConfig = require('../config/multerConfig')
multer(multerConfig).single('file')
