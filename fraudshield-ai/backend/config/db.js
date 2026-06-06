const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://soham7dalvi_db_user:awaFWfHODN7WRCp0@ac-f2kmmx9-shard-00-00.ga0vmq0.mongodb.net:27017,ac-f2kmmx9-shard-00-01.ga0vmq0.mongodb.net:27017,ac-f2kmmx9-shard-00-02.ga0vmq0.mongodb.net:27017/fraudshield?authSource=admin&retryWrites=true&w=majority';

const MONGOOSE_OPTIONS = {
  tls: true,
  serverSelectionTimeoutMS: 10000,
};

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  try {
    await mongoose.connect(MONGODB_URI, MONGOOSE_OPTIONS);
    isConnected = true;
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
}

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.log('MongoDB disconnected');
});

module.exports = { connectDB };
