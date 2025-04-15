import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import betRoutes from './routes/bet';
import sportRoutes from './routes/sport';
import eventRoutes from './routes/event';
import adminRoutes from './routes/admin';
import marketRoutes from './routes/market';

// Import middleware
import { errorHandler } from './middleware/error';
import { requestLogger } from './middleware/logger';
import { notFoundHandler } from './middleware/notFound';

const app: Express = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(helmet());
app.use(cookieParser());

// Request logging middleware
app.use(requestLogger);

// HTTP request logging (for development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bets', betRoutes);
app.use('/api/sports', sportRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/markets', marketRoutes);

// Health check route
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Not found middleware - should be after all routes
app.use(notFoundHandler);

// Error handling middleware - should be the last middleware
app.use(errorHandler);

export default app;
