import mongoose from 'mongoose';
import { config } from './index.js';

export async function connectDatabase() {
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    });
    console.log(`[MongoDB] Connected successfully to ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('[MongoDB] Connection error:', error.message);
    console.warn('[MongoDB] Running with in-memory / limited fallback if database is unavailable.');
    return null;
  }
}
