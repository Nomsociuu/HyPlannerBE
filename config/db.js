const mongoose = require("mongoose");

// ✅ SERVERLESS OPTIMIZATION: Cache MongoDB connection
// Vercel serverless functions can reuse connections across invocations
let cachedConnection = null;

const connectDB = async () => {
  // If connection exists and is ready, reuse it
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log("♻️ Reusing cached MongoDB connection");
    return cachedConnection;
  }

  try {
    // Configure mongoose for serverless
    mongoose.set("strictQuery", false);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Serverless optimization settings
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 2, // Minimum 2 connections in pool
      maxIdleTimeMS: 10000, // Remove connections idle > 10s
    });

    cachedConnection = conn;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    cachedConnection = null;
    throw error;
  }
};

module.exports = connectDB;
