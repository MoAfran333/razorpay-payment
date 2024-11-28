const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected Successfully`);
  } catch (e) {
    console.log(`Error connecting to mongodb : ${e.message}`);
  }
};

module.exports = connectDB;
