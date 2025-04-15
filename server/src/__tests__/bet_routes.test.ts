import { prisma } from './setup';
import request from 'supertest';
import app from '../app';
import jwt from 'jsonwebtoken';
import { BetType, MarketStatus } from '@prisma/client';

// Create a supertest agent for making HTTP requests
const agent = request(app);

// Helper functions for testing
const createUser = async (overrides: any = {}) => {
  const userData = {
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    password: await hashPassword('password123'),
    role: 'USER',
    balance: 100,
    availableBalance: 100,
    reservedBalance: 0,
    ...overrides
  };

  return prisma.user.create({
    data: userData
  });
};

const hashPassword = async (password: string) => {
  const bcrypt = require('bcryptjs');
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const generateToken = (user: any) => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'test_secret', {
    expiresIn: '1h'
  });
};

const createSport = async (overrides: any = {}) => {
  const sportData = {
    name: `Test Sport ${Date.now()}`,
    slug: `test-sport-${Date.now()}`,
    active: true,
    ...overrides
  };

  return prisma.sport.create({
    data: sportData
  });
};

const createEvent = async (sportId: string, overrides: any = {}) => {
  const eventData = {
    name: `Test Event ${Date.now()}`,
    sportId,
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    status: 'SCHEDULED',
    ...overrides
  };

  const event = await prisma.event.create({
    data: eventData
  });

  // Create participants
  const participants = await Promise.all([
    prisma.participant.create({
      data: {
        name: `Team A ${Date.now()}`,
        odds: 1.5,
        eventId: event.id
      }
    }),
    prisma.participant.create({
      data: {
        name: `Team B ${Date.now()}`,
        odds: 2.5,
        eventId: event.id
      }
    })
  ]);

  return { ...event, participants };
};

const createMarket = async (eventId: string, overrides: any = {}) => {
  const marketData = {
    name: `Test Market ${Date.now()}`,
    eventId,
    status: MarketStatus.OPEN,
    ...overrides
  };

  return prisma.market.create({
    data: marketData
  });
};

describe('Bet Routes', () => {
  describe('GET /api/bets/balance', () => {
    it('should return user balance when authenticated', async () => {
      // Create a user with specific balance values
      const user = await createUser({
        balance: 100,
        availableBalance: 80,
        reservedBalance: 20
      });
      const token = generateToken(user);

      const response = await agent
        .get('/api/bets/balance')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.balance).toBe(100);
      expect(response.body.data.availableBalance).toBe(80);
      expect(response.body.data.reservedBalance).toBe(20);
    });

    it('should return 401 if not authenticated', async () => {
      const response = await agent
        .get('/api/bets/balance')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('PUT /api/bets/balance', () => {
    it('should update user balance when authenticated', async () => {
      // Create a user
      const user = await createUser({
        balance: 100,
        availableBalance: 100,
        reservedBalance: 0
      });
      const token = generateToken(user);

      // Add to balance
      const response1 = await agent
        .put('/api/bets/balance')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 50 })
        .expect(200);

      expect(response1.body.success).toBe(true);
      expect(response1.body.data).toBeDefined();
      expect(response1.body.data.balance).toBe(150);
      expect(response1.body.data.availableBalance).toBe(150);

      // Subtract from balance
      const response2 = await agent
        .put('/api/bets/balance')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: -30 })
        .expect(200);

      expect(response2.body.success).toBe(true);
      expect(response2.body.data).toBeDefined();
      expect(response2.body.data.balance).toBe(120);
      expect(response2.body.data.availableBalance).toBe(120);
    });

    it('should return 401 if not authenticated', async () => {
      const response = await agent
        .put('/api/bets/balance')
        .send({ amount: 50 })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
});
