const mongoose = require("mongoose");
const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

let isConnected = false;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      family: 4,
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    console.error("👉 Check your MONGO_URI and password in the .env file.");
    console.error("👉 Make sure your IP is whitelisted in MongoDB Atlas.");
    // Do NOT exit — keep server alive so API returns proper JSON errors
  }
};

// Middleware you can use on routes to guard against DB being down
const requireDB = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: "Database not connected. Check your MONGO_URI in .env and ensure your IP is whitelisted on MongoDB Atlas.",
    });
  }
  next();
};

module.exports = connectDB;
module.exports.requireDB = requireDB;
