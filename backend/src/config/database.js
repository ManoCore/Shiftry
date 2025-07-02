require('dotenv').config();
const mongoose = require('mongoose');
const dbCredentials=process.env.dbCredentials;


const connectDB = async () => {
  try {
    await mongoose.connect(dbCredentials,{

    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("Database connection failed:", err.message);
    throw err;
  }
};

module.exports = connectDB;
