const mongoose = require('mongoose');

const connectToDB = async () => {
  try {
    const response = await mongoose.connect(`${process.env.MONGO_URI}`)
    if (response) {
      console.log('Connected to database')
    }
  } catch (error) {
    console.log(error)
  }
};

module.exports = connectToDB;