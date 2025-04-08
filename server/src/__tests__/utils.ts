import request from 'supertest';
import jwt from 'jsonwebtoken';
import { PrismaClient, User, Role, TransactionType, TransactionStatus } from '@prisma/client';
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
// Counter to ensure unique sport names
let sportCounter = 0;

export const createSport = async (overrides: any = {}): Promise<any> => {
  // Generate a unique identifier for this sport
  sportCounter++;
  const timestamp = Date.now();
  const uniqueId = `${timestamp}-${sportCounter}-${Math.random().toString(36).substring(2, 7)}`;

  // If name is provided in overrides, make it unique
  let sportName = overrides.name || 'Test Sport';
  if (!sportName.includes(uniqueId)) {
    sportName = `${sportName} ${uniqueId}`;
  }

  // Create a slug from the name
  const slug = sportName.toLowerCase().replace(/\s+/g, '-');

  const sportData = {
    name: sportName,
    slug,
    active: true,
    ...overrides,
    // Override name and slug again to ensure they're unique
    name: sportName,
    slug
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
// Counter to ensure unique event names
let eventCounter = 0;

export const createEvent = async (sportId: string, overrides: any = {}): Promise<any> => {
  // Generate a unique identifier for this event
  eventCounter++;
  const timestamp = Date.now();
  const uniqueId = `${timestamp}-${eventCounter}-${Math.random().toString(36).substring(2, 7)}`;

  // If name is provided in overrides, make it unique
  let eventName = overrides.name || 'Test Event';
  if (!eventName.includes(uniqueId)) {
    eventName = `${eventName} ${uniqueId}`;
  }

  const eventData = {
    name: eventName,
    sportId,
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    status: 'SCHEDULED',
    ...overrides,
    // Override name again to ensure it's unique
    name: eventName
  };

  // Create event
  const event = await prisma.event.create({
    data: eventData
  });

  // Create participants with unique names
  const participants = await Promise.all([
    prisma.participant.create({
      data: {
        name: `Team A ${uniqueId}`,
        odds: 1.5,
        eventId: event.id
      }
    }),
    prisma.participant.create({
      data: {
        name: `Team B ${uniqueId}`,
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
  // Get the event to find the participant names
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { participants: true }
  });

  if (!event || !event.participants || event.participants.length < 2) {
    throw new Error('Event not found or has insufficient participants');
  }

  // Use the first participant's name as the default selection
  const defaultSelection = event.participants[0].name;

  const betData = {
    userId,
    eventId,
    amount: 10,
    odds: 1.5,
    selection: defaultSelection,
    potentialWinnings: 15,
    status: 'PENDING',
    ...overrides
  };

  // If selection is 'Team A' or 'Team B' in overrides, replace with actual participant names
  if (betData.selection === 'Team A' && event.participants[0].name.includes('Team A')) {
    betData.selection = event.participants[0].name;
  } else if (betData.selection === 'Team B' && event.participants[1].name.includes('Team B')) {
    betData.selection = event.participants[1].name;
  }

  return prisma.bet.create({
    data: betData
  });
};

/**
 * Create a transaction
 * @param userId User ID
 * @param overrides Optional overrides for transaction properties
 * @returns Created transaction
 */
export const createTransaction = async (userId: string, overrides: any = {}): Promise<any> => {
  const transactionData = {
    userId,
    amount: 100,
    type: TransactionType.DEPOSIT,
    status: TransactionStatus.PENDING,
    description: 'Test transaction',
    ...overrides
  };

  return prisma.transaction.create({
    data: transactionData
  });
};

/**
 * Create an admin log
 * @param userId Admin user ID
 * @param overrides Optional overrides for admin log properties
 * @returns Created admin log
 */
export const createAdminLog = async (userId: string, overrides: any = {}): Promise<any> => {
  const logData = {
    userId,
    action: 'TEST_ACTION',
    details: 'Test admin action',
    ipAddress: '127.0.0.1',
    ...overrides
  };

  return prisma.adminLog.create({
    data: logData
  });
};

/**
 * Create multiple users
 * @param count Number of users to create
 * @param overrides Optional overrides for user properties
 * @returns Array of created users
 */
export const createMultipleUsers = async (count: number, overrides: any = {}): Promise<User[]> => {
  const users = [];
  for (let i = 0; i < count; i++) {
    users.push(await createUser(overrides));
  }
  return users;
};

/**
 * Create multiple transactions
 * @param userId User ID
 * @param count Number of transactions to create
 * @param overrides Optional overrides for transaction properties
 * @returns Array of created transactions
 */
export const createMultipleTransactions = async (userId: string, count: number, overrides: any = {}): Promise<any[]> => {
  const transactions = [];
  for (let i = 0; i < count; i++) {
    transactions.push(await createTransaction(userId, overrides));
  }
  return transactions;
};


