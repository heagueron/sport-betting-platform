import prisma from '../config/prisma';
import * as concurrencyService from '../services/concurrency';
import * as betMatchingService from '../services/betMatching';
import { BetStatus, BetType, MarketStatus } from '@prisma/client';
import { createTestEvent, createTestMarket } from './utils';

describe('Concurrency Management', () => {
  let user1: any;
  let user2: any;
  let event: any;
  let market: any;

  beforeAll(async () => {
    // Clean up any existing data
    await prisma.betMatch.deleteMany({});
    await prisma.bet.deleteMany({});
    await prisma.market.deleteMany({});
    await prisma.participant.deleteMany({});
    await prisma.event.deleteMany({});

    // Delete test users if they exist
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['concurrency1@example.com', 'concurrency2@example.com']
        }
      }
    });

    // Create test users
    user1 = await prisma.user.create({
      data: {
        email: 'concurrency1@example.com',
        name: 'Concurrency Test User 1',
        password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // password123
        role: 'USER',
        balance: 1000,
        availableBalance: 1000,
        reservedBalance: 0
      }
    });

    user2 = await prisma.user.create({
      data: {
        email: 'concurrency2@example.com',
        name: 'Concurrency Test User 2',
        password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // password123
        role: 'USER',
        balance: 1000,
        availableBalance: 1000,
        reservedBalance: 0
      }
    });

    console.log('Created test users:', user1.id, user2.id);

    // Create test event
    event = await createTestEvent();

    // Create test market
    market = await createTestMarket(event.id);
  });

  afterAll(async () => {
    // Clean up
    await prisma.betMatch.deleteMany({});
    await prisma.bet.deleteMany({});
    await prisma.market.deleteMany({});
    await prisma.participant.deleteMany({});
    await prisma.event.deleteMany({});
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['concurrency1@example.com', 'concurrency2@example.com']
        }
      }
    });
  });

  describe('Market locking', () => {
    it('should acquire and release a market lock', async () => {
      // Verificar que el mercado existe
      const marketExists = await prisma.market.findUnique({
        where: { id: market.id }
      });

      expect(marketExists).toBeDefined();

      // Acquire lock
      const lockedMarket = await concurrencyService.acquireMarketLock(market.id);

      expect(lockedMarket).toBeDefined();
      expect(lockedMarket.locked).toBe(true);
      expect(lockedMarket.lockedAt).toBeDefined();

      // Release lock
      await concurrencyService.releaseMarketLock(market.id);

      // Verify lock is released
      const releasedMarket = await prisma.market.findUnique({
        where: { id: market.id }
      });

      expect(releasedMarket?.locked).toBe(false);
      expect(releasedMarket?.lockedAt).toBeNull();
    });

    it('should handle concurrent lock attempts', async () => {
      // Verificar que el mercado existe
      const marketExists = await prisma.market.findUnique({
        where: { id: market.id }
      });

      expect(marketExists).toBeDefined();

      if (marketExists) {
        // Simular un intento de bloqueo concurrente
        const mockLockFn = jest.fn().mockImplementation(async () => {
          // Simular que el mercado ya está bloqueado
          throw new Error('Mercado temporalmente bloqueado');
        });

        // Usar withRetry para manejar el error
        try {
          await concurrencyService.withRetry(mockLockFn, 2);
          fail('Debería haber lanzado un error');
        } catch (error: any) {
          expect(error.message).toContain('Operación fallida después de');
          expect(mockLockFn).toHaveBeenCalledTimes(2);
        }
      }
    });
  });

  describe('Optimistic locking', () => {
    it('should update a user with optimistic locking', async () => {
      // Verificar que el usuario existe
      const currentUser = await prisma.user.findUnique({
        where: { id: user1.id }
      });

      expect(currentUser).toBeDefined();

      if (currentUser) {
        // Update user
        const updatedUser = await concurrencyService.updateUserWithOptimisticLock(
          user1.id,
          { name: 'Updated Name' },
          currentUser.version
        );

        expect(updatedUser).toBeDefined();
        expect(updatedUser.name).toBe('Updated Name');
        expect(updatedUser.version).toBe(currentUser.version + 1);
      }
    });

    it('should handle concurrent updates with retry mechanism', async () => {
      // Create a test function that will be retried
      const testFunction = jest.fn().mockImplementation(async () => {
        // Simulate success on the third try
        if (testFunction.mock.calls.length < 3) {
          throw { code: 'P2034', message: 'could not serialize access' };
        }
        return { success: true };
      });

      // Execute with retry
      const result = await concurrencyService.withRetry(testFunction);

      expect(result).toEqual({ success: true });
      expect(testFunction).toHaveBeenCalledTimes(3);
    });
  });

  describe('Queue processing', () => {
    it('should add a bet to the processing queue', async () => {
      // Verificar que los usuarios existen
      const userExists = await prisma.user.findUnique({
        where: { id: user1.id }
      });

      expect(userExists).toBeDefined();

      if (userExists) {
        // Create a test bet
        const bet = await prisma.bet.create({
          data: {
            amount: 100,
            odds: 2.0,
            selection: 'Team A',
            potentialWinnings: 100,
            type: BetType.BACK,
            userId: user1.id,
            eventId: event.id,
            marketId: market.id,
            status: BetStatus.UNMATCHED
          }
        });

        // Add to queue
        const queuePosition = await concurrencyService.addBetToProcessingQueue(bet.id);

        expect(queuePosition).toBeGreaterThan(0);

        // Verify bet is in queue
        const queuedBet = await prisma.bet.findUnique({
          where: { id: bet.id }
        });

        expect(queuedBet?.processingQueue).toBe(queuePosition);
        expect(queuedBet?.processingStatus).toBe('QUEUED');
      }
    });
  });

  describe('Transaction isolation', () => {
    it('should execute operations with market lock', async () => {
      // Verificar que el mercado existe
      const marketExists = await prisma.market.findUnique({
        where: { id: market.id }
      });

      expect(marketExists).toBeDefined();

      if (marketExists) {
        // Define a test operation
        const testOperation = async (tx: any) => {
          // Update market name
          const updatedMarket = await tx.market.update({
            where: { id: market.id },
            data: { name: 'Updated Market Name' }
          });

          return updatedMarket;
        };

        // Execute with market lock
        const result = await concurrencyService.withMarketLock(market.id, testOperation);

        expect(result).toBeDefined();
        expect(result.name).toBe('Updated Market Name');

        // Verify market is not locked after operation
        const currentMarket = await prisma.market.findUnique({
          where: { id: market.id }
        });

        expect(currentMarket?.locked).toBe(false);
      }
    });
  });
});
