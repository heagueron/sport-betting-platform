import request from 'supertest';
import jwt from 'jsonwebtoken';
import { PrismaClient, User, Role } from '@prisma/client';
import app from '../app';
import { prisma } from './setup';

// Create a supertest agent for making HTTP requests
export const agent = request(app);

/**
 * Create a test user
 * @param overrides Optional overrides for user properties
 * @returns Created user
 */
export const createUser = async (overrides: Partial<User> = {}): Promise<User> => {
  // Default user data
  const password = overrides.password || 'password123';
  delete overrides.password; // Remove password from overrides to avoid conflicts

  const userData = {
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    password: await hashPassword(password),
    role: 'USER' as Role,
    balance: 100,
    ...overrides
  };

  // Create user in database
  return prisma.user.create({
    data: userData
  });
};

/**
 * Create an admin user
 * @returns Created admin user
 */
export const createAdmin = async (): Promise<User> => {
  return createUser({ role: 'ADMIN' });
};

/**
 * Hash a password
 * @param password Password to hash
 * @returns Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const bcrypt = require('bcryptjs');
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Generate a JWT token for a user
 * @param user User to generate token for
 * @returns JWT token
 */
export const generateToken = (user: User): string => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'test_secret', {
    expiresIn: '1h'
  });
};

/**
 * Create a sport
 * @param overrides Optional overrides for sport properties
 * @returns Created sport
 */
export const createSport = async (overrides: any = {}): Promise<any> => {
  // Generate a unique timestamp for this sport
  const timestamp = Date.now() + Math.floor(Math.random() * 1000);

  const sportData = {
    name: `Test Sport ${timestamp}`,
    slug: `test-sport-${timestamp}`,
    active: true,
    ...overrides
  };

  return prisma.sport.create({
    data: sportData
  });
};

/**
 * Create an event
 * @param sportId Sport ID
 * @param overrides Optional overrides for event properties
 * @returns Created event with participants
 */
export const createEvent = async (sportId: string, overrides: any = {}): Promise<any> => {
  const eventData = {
    name: `Test Event ${Date.now()}`,
    sportId,
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    status: 'SCHEDULED',
    ...overrides
  };

  // Create event
  const event = await prisma.event.create({
    data: eventData
  });

  // Create participants
  const participants = await Promise.all([
    prisma.participant.create({
      data: {
        name: 'Team A',
        odds: 1.5,
        eventId: event.id
      }
    }),
    prisma.participant.create({
      data: {
        name: 'Team B',
        odds: 2.5,
        eventId: event.id
      }
    })
  ]);

  return { ...event, participants };
};

/**
 * Create a bet
 * @param userId User ID
 * @param eventId Event ID
 * @param overrides Optional overrides for bet properties
 * @returns Created bet
 */
export const createBet = async (userId: string, eventId: string, overrides: any = {}): Promise<any> => {
  const betData = {
    userId,
    eventId,
    amount: 10,
    odds: 1.5,
    selection: 'Team A',
    potentialWinnings: 15,
    status: 'PENDING',
    ...overrides
  };

  return prisma.bet.create({
    data: betData
  });
};
