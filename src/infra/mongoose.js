const mongoose = require('mongoose')
module.exports = {
  connect: async () => {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true
    }, () => console.log('Database Connected!'))
  }
}
