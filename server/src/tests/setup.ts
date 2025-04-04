/**
 * Test setup file
 * This file will be used to set up the test environment
 */

// Import dependencies
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.test' });

// Connect to test database before tests
beforeAll(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || '');
    console.log('Connected to test database');
  } catch (error) {
    console.error('Error connecting to test database:', error);
    process.exit(1);
  }
});

// Clear database collections after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Disconnect from database after all tests
afterAll(async () => {
  await mongoose.connection.close();
  console.log('Disconnected from test database');
});
