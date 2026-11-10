const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    if (process.env.NODE_ENV === 'test') {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      console.log(`[Test DB] Connected to In-Memory MongoDB: ${uri}`);
    } else if (!uri || uri.trim() === '') {
      console.log('[DB] No MONGODB_URI provided in environment. Initializing local in-memory MongoDB...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      console.log(`[DB] Successfully started In-Memory MongoDB instance at: ${uri}`);
    }

    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    // If external URI failed in development, try fallback to memory server
    if (process.env.NODE_ENV !== 'production' && !mongod) {
      try {
        console.log('[DB] External connection failed. Falling back to In-Memory MongoDB for local development...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongod = await MongoMemoryServer.create();
        const fallbackUri = mongod.getUri();
        const fallbackConn = await mongoose.connect(fallbackUri);
        console.log(`[DB] Fallback In-Memory MongoDB Connected at: ${fallbackUri}`);
        return fallbackConn;
      } catch (fallbackErr) {
        console.error('Fallback in-memory MongoDB failed:', fallbackErr);
        process.exit(1);
      }
    }
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongod) {
      await mongod.stop();
    }
  } catch (err) {
    console.error('Error disconnecting from database:', err);
  }
};

module.exports = { connectDB, disconnectDB };

