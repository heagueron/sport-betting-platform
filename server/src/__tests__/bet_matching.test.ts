import request from 'supertest';
import app from '../app';
import prisma from '../config/prisma';
import { BetStatus, BetType, MarketStatus } from '@prisma/client';
import { createTestUser, createTestEvent, createTestMarket, loginTestUser } from './utils';
import * as betMatchingService from '../services/betMatching';
import { createTestBackBet, createTestLayBet } from './bet_test_utils';

describe('Bet Matching Algorithm', () => {
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
          in: ['betmatch1@example.com', 'betmatch2@example.com']
        }
      }
    });

    // Create test users
    user1 = await prisma.user.create({
      data: {
        email: 'betmatch1@example.com',
        name: 'Test User 1',
        password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // password123
        role: 'USER',
        balance: 1000,
        availableBalance: 1000,
        reservedBalance: 0
      }
    });

    user2 = await prisma.user.create({
      data: {
        email: 'betmatch2@example.com',
        name: 'Test User 2',
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
    await prisma.event.deleteMany({});
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['betmatch1@example.com', 'betmatch2@example.com']
        }
      }
    });
  });

  describe('Matching back and lay bets', () => {
    it('should match a back bet with a lay bet at the same odds', async () => {
      // Create a lay bet first directly using the test utility
      const layBet = await createTestLayBet(user1.id, {
        eventId: event.id,
        marketId: market.id,
        selection: 'Team A',
        amount: 100,
        odds: 2.0,
        type: BetType.LAY
      });

      // Verify the lay bet was created correctly
      expect(layBet).toBeDefined();
      expect(layBet.userId).toBe(user1.id);
      expect(layBet.selection).toBe('Team A');

      // Create a back bet that should match with the lay bet
      const backBet = await createTestBackBet(user2.id, {
        eventId: event.id,
        marketId: market.id,
        selection: 'Team A',
        amount: 100,
        odds: 2.0,
        type: BetType.BACK
      });

      // Verify the back bet was created correctly
      expect(backBet).toBeDefined();
      expect(backBet.userId).toBe(user2.id);
      expect(backBet.selection).toBe('Team A');

      // Match the back bet
      const matchResult = await betMatchingService.matchBet(backBet.id);

      // Verify match result
      expect(matchResult.matchedAmount).toBe(100);
      expect(matchResult.matches.length).toBe(1);

      // Verify bet statuses
      const updatedBackBet = await prisma.bet.findUnique({
        where: { id: backBet.id }
      });
      const updatedLayBet = await prisma.bet.findUnique({
        where: { id: layBet.id }
      });

      expect(updatedBackBet?.status).toBe(BetStatus.FULLY_MATCHED);
      expect(updatedLayBet?.status).toBe(BetStatus.FULLY_MATCHED);
      expect(updatedBackBet?.matchedAmount).toBe(100);
      expect(updatedLayBet?.matchedAmount).toBe(100);
    });

    it('should match a back bet with a lay bet at better odds', async () => {
      // Create new users for this test
      const testUser1 = await prisma.user.create({
        data: {
          email: 'betmatch1_better_odds@example.com',
          name: 'Test User Better Odds 1',
          password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm',
          role: 'USER',
          balance: 1000,
          availableBalance: 1000,
          reservedBalance: 0
        }
      });

      const testUser2 = await prisma.user.create({
        data: {
          email: 'betmatch2_better_odds@example.com',
          name: 'Test User Better Odds 2',
          password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm',
          role: 'USER',
          balance: 1000,
          availableBalance: 1000,
          reservedBalance: 0
        }
      });

      // Create a lay bet first (lower odds is better for lay)
      const layBet = await createTestLayBet(testUser1.id, {
        eventId: event.id,
        marketId: market.id,
        selection: 'Team B',
        amount: 100,
        odds: 1.8, // Lower odds than the back bet
        type: BetType.LAY
      });

      // Create a back bet with higher odds
      const backBet = await createTestBackBet(testUser2.id, {
        eventId: event.id,
        marketId: market.id,
        selection: 'Team B',
        amount: 100,
        odds: 2.0, // Higher odds than the lay bet
        type: BetType.BACK
      });

      // Match the back bet
      const matchResult = await betMatchingService.matchBet(backBet.id);

      // Verify match result
      expect(matchResult.matchedAmount).toBe(100);
      expect(matchResult.matches.length).toBe(1);

      // Verify bet statuses
      const updatedBackBet = await prisma.bet.findUnique({
        where: { id: backBet.id }
      });
      const updatedLayBet = await prisma.bet.findUnique({
        where: { id: layBet.id }
      });

      expect(updatedBackBet?.status).toBe(BetStatus.FULLY_MATCHED);
      expect(updatedLayBet?.status).toBe(BetStatus.FULLY_MATCHED);
      expect(updatedBackBet?.matchedAmount).toBe(100);
      expect(updatedLayBet?.matchedAmount).toBe(100);
    });

    it('should handle partial matching when amounts differ', async () => {
      // Create new users for this test
      const testUser1 = await prisma.user.create({
        data: {
          email: 'betmatch1_partial@example.com',
          name: 'Test User Partial 1',
          password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm',
          role: 'USER',
          balance: 1000,
          availableBalance: 1000,
          reservedBalance: 0
        }
      });

      const testUser2 = await prisma.user.create({
        data: {
          email: 'betmatch2_partial@example.com',
          name: 'Test User Partial 2',
          password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm',
          role: 'USER',
          balance: 1000,
          availableBalance: 1000,
          reservedBalance: 0
        }
      });

      // Create a lay bet first with larger amount
      const layBet = await createTestLayBet(testUser1.id, {
        eventId: event.id,
        marketId: market.id,
        selection: 'Team C',
        amount: 200, // Larger amount
        odds: 2.0,
        type: BetType.LAY
      });

      // Create a back bet with smaller amount
      const backBet = await createTestBackBet(testUser2.id, {
        eventId: event.id,
        marketId: market.id,
        selection: 'Team C',
        amount: 100, // Smaller amount
        odds: 2.0,
        type: BetType.BACK
      });

      // Match the back bet
      const matchResult = await betMatchingService.matchBet(backBet.id);

      // Verify match result
      expect(matchResult.matchedAmount).toBe(100);
      expect(matchResult.matches.length).toBe(1);

      // Verify bet statuses
      const updatedBackBet = await prisma.bet.findUnique({
        where: { id: backBet.id }
      });
      const updatedLayBet = await prisma.bet.findUnique({
        where: { id: layBet.id }
      });

      expect(updatedBackBet?.status).toBe(BetStatus.FULLY_MATCHED);
      expect(updatedLayBet?.status).toBe(BetStatus.PARTIALLY_MATCHED);
      expect(updatedBackBet?.matchedAmount).toBe(100);
      expect(updatedLayBet?.matchedAmount).toBe(100);
    });

    it('should prioritize matching by best odds then by time', async () => {
      // Create new users for this test
      const testUser1 = await prisma.user.create({
        data: {
          email: 'betmatch1_priority@example.com',
          name: 'Test User Priority 1',
          password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm',
          role: 'USER',
          balance: 1000,
          availableBalance: 1000,
          reservedBalance: 0
        }
      });

      const testUser2 = await prisma.user.create({
        data: {
          email: 'betmatch2_priority@example.com',
          name: 'Test User Priority 2',
          password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm',
          role: 'USER',
          balance: 1000,
          availableBalance: 1000,
          reservedBalance: 0
        }
      });

      // Create three lay bets with different odds
      const layBet1 = await createTestLayBet(testUser1.id, {
        eventId: event.id,
        marketId: market.id,
        selection: 'Team D',
        amount: 100,
        odds: 2.2, // Worst odds for lay
        type: BetType.LAY
      });

      const layBet2 = await createTestLayBet(testUser1.id, {
        eventId: event.id,
        marketId: market.id,
        selection: 'Team D',
        amount: 100,
        odds: 1.8, // Best odds for lay
        type: BetType.LAY
      });

      const layBet3 = await createTestLayBet(testUser1.id, {
        eventId: event.id,
        marketId: market.id,
        selection: 'Team D',
        amount: 100,
        odds: 2.0, // Medium odds for lay
        type: BetType.LAY
      });

      // Create a back bet that should match with the best odds first
      const backBet = await createTestBackBet(testUser2.id, {
        eventId: event.id,
        marketId: market.id,
        selection: 'Team D',
        amount: 200, // Enough to match two lay bets
        odds: 2.5, // Higher than all lay bets
        type: BetType.BACK
      });

      // Match the back bet
      const matchResult = await betMatchingService.matchBet(backBet.id);

      // Verify match result
      expect(matchResult.matchedAmount).toBe(200);
      expect(matchResult.matches.length).toBe(2);

      // Get the updated bets
      const updatedLayBet1 = await prisma.bet.findUnique({
        where: { id: layBet1.id }
      });
      const updatedLayBet2 = await prisma.bet.findUnique({
        where: { id: layBet2.id }
      });
      const updatedLayBet3 = await prisma.bet.findUnique({
        where: { id: layBet3.id }
      });

      // The best odds (1.8) should be matched first, then the next best (2.0)
      expect(updatedLayBet2?.status).toBe(BetStatus.FULLY_MATCHED);
      expect(updatedLayBet3?.status).toBe(BetStatus.FULLY_MATCHED);
      expect(updatedLayBet1?.status).toBe(BetStatus.UNMATCHED); // Worst odds, not matched
    });
  });

  describe('Order book functionality', () => {
    it('should return the order book for a market', async () => {
      // Create new users for this test
      const testUser1 = await prisma.user.create({
        data: {
          email: 'betmatch1_orderbook@example.com',
          name: 'Test User OrderBook 1',
          password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm',
          role: 'USER',
          balance: 1000,
          availableBalance: 1000,
          reservedBalance: 0
        }
      });

      const testUser2 = await prisma.user.create({
        data: {
          email: 'betmatch2_orderbook@example.com',
          name: 'Test User OrderBook 2',
          password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm',
          role: 'USER',
          balance: 1000,
          availableBalance: 1000,
          reservedBalance: 0
        }
      });

      // Create some unmatched bets for a new selection
      await createTestBackBet(testUser1.id, {
        eventId: event.id,
        marketId: market.id,
        selection: 'Team E',
        amount: 100,
        odds: 2.0,
        type: BetType.BACK
      });

      await createTestLayBet(testUser2.id, {
        eventId: event.id,
        marketId: market.id,
        selection: 'Team E',
        amount: 150,
        odds: 2.2,
        type: BetType.LAY
      });

      // Get the order book
      const orderBook = await betMatchingService.getMarketOrderBook(market.id, 'Team E');

      // Verify order book structure
      expect(orderBook).toHaveProperty('backBets');
      expect(orderBook).toHaveProperty('layBets');

      // Verify back bets
      expect(orderBook.backBets.length).toBeGreaterThan(0);
      expect(orderBook.backBets[0]).toHaveProperty('odds');
      expect(orderBook.backBets[0]).toHaveProperty('totalAmount');

      // Verify lay bets
      expect(orderBook.layBets.length).toBeGreaterThan(0);
      expect(orderBook.layBets[0]).toHaveProperty('odds');
      expect(orderBook.layBets[0]).toHaveProperty('totalAmount');
    });
  });

  describe('Liability calculation', () => {
    it('should correctly calculate liability for lay bets', () => {
      const amount = 100;
      const odds = 3.0;

      const liability = betMatchingService.calculateLayBetLiability(amount, odds);

      // Liability = (odds - 1) * amount = (3 - 1) * 100 = 200
      expect(liability).toBe(200);
    });
  });
});
