import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDB, disconnectDB } from './config/db';
import * as queueProcessor from './services/queueProcessor';

// Define port
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Start bet queue processor
const queueProcessorInterval = queueProcessor.startQueueProcessor();

// Handle graceful shutdown
const gracefulShutdown = async () => {
  console.log('Shutting down gracefully...');

  // Stop queue processor
  queueProcessor.stopQueueProcessor(queueProcessorInterval);
  console.log('Queue processor stopped');

  server.close(async () => {
    console.log('HTTP server closed');
    await disconnectDB();
    process.exit(0);
  });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process

  // Stop queue processor
  queueProcessor.stopQueueProcessor(queueProcessorInterval);
  console.log('Queue processor stopped due to error');

  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

// Listen for SIGTERM signal
process.on('SIGTERM', gracefulShutdown);

// Listen for SIGINT signal (Ctrl+C)
process.on('SIGINT', gracefulShutdown);
