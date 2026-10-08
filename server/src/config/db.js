const mongoose = require('mongoose');

let isMongoConnected = false;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_ops_command_center';
    
    // Suppress Mongoose strictQuery warning
    mongoose.set('strictQuery', false);

    console.log('[Database] Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    
    isMongoConnected = true;
    console.log('[Database] MongoDB connected successfully');
    console.log('[Database] Active Storage Engine: MongoDB');
  } catch (error) {
    isMongoConnected = false;
    const safeError = (error.message || 'Connection timeout or network failure').replace(/\/\/[^@]+@/, '//***:***@');
    console.log(`[Database Warning] MongoDB connection failed: ${safeError}`);
    console.log('[Database] Active Storage Engine: Enterprise In-Memory Data Store');
  }
};

const getIsConnected = () => isMongoConnected;

module.exports = { connectDB, getIsConnected };
