import prisma from '../config/prisma';
import * as betService from '../services/bet';
import * as marketService from '../services/market';
import { BetStatus, BetType, MarketStatus } from '@prisma/client';
import { createTestEvent, createTestMarket } from './utils';

// Función auxiliar para crear un entorno de prueba aislado
async function setupIsolatedTestEnvironment() {
  // Generar emails únicos para evitar conflictos
  const timestamp = Date.now();
  const email1 = `balance1_${timestamp}@example.com`;
  const email2 = `balance2_${timestamp}@example.com`;

  // Crear usuarios de prueba
  const user1 = await prisma.user.create({
    data: {
      email: email1,
      name: 'Balance Test User 1',
      password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // password123
      role: 'USER',
      balance: 1000,
      availableBalance: 1000,
      reservedBalance: 0
    }
  });

  const user2 = await prisma.user.create({
    data: {
      email: email2,
      name: 'Balance Test User 2',
      password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // password123
      role: 'USER',
      balance: 1000,
      availableBalance: 1000,
      reservedBalance: 0
    }
  });

  // Crear evento de prueba
  const event = await createTestEvent();

  // Crear mercado de prueba
  const market = await createTestMarket(event.id);

  return { user1, user2, event, market, emails: [email1, email2] };
}

// Función auxiliar para limpiar el entorno de prueba
async function cleanupTestEnvironment(emails: string[]) {
  await prisma.betMatch.deleteMany({});
  await prisma.bet.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.market.deleteMany({});
  await prisma.participant.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.user.deleteMany({
    where: {
      email: {
        in: emails
      }
    }
  });
}

describe('Balance Management', () => {

  describe('Lay bet funds reservation', () => {
    it('should reserve funds when creating a lay bet', async () => {
      // Configurar entorno aislado
      const { user1, user2, event, market, emails } = await setupIsolatedTestEnvironment();

      try {
        // Get initial user balance
        const initialUser = await prisma.user.findUnique({
          where: { id: user1.id }
        });

        // Create a lay bet
        const betData = {
          eventId: event.id,
          marketId: market.id,
          selection: 'Team A',
          amount: 100,
          odds: 2.0,
          type: BetType.LAY
        };

        const bet = await betService.createLayBet(user1.id, betData);

        // Calculate expected liability
        const liability = betData.amount * (betData.odds - 1); // 100 * (2.0 - 1) = 100

        // Get updated user
        const updatedUser = await prisma.user.findUnique({
          where: { id: user1.id }
        });

        // Verify balances
        expect(updatedUser?.availableBalance).toBe(initialUser?.availableBalance! - liability);
        expect(updatedUser?.reservedBalance).toBe(initialUser?.reservedBalance! + liability);

        // Verify transaction was created
        const transactions = await prisma.transaction.findMany({
          where: {
            userId: user1.id,
            type: 'RESERVE'
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        });

        expect(transactions.length).toBe(1);
        expect(transactions[0].amount).toBe(liability);
        expect(transactions[0].status).toBe('COMPLETADA');
      } finally {
        // Limpiar entorno
        await cleanupTestEnvironment(emails);
      }
    });
  });

  describe('Cancelling unmatched bets', () => {
    it('should refund funds when cancelling a back bet', async () => {
      // Configurar entorno aislado
      const { user1, user2, event, market, emails } = await setupIsolatedTestEnvironment();

      try {
        // Create a back bet directly in the database
        const bet = await prisma.bet.create({
          data: {
            amount: 50,
            odds: 3.0,
            selection: 'Team B',
            potentialWinnings: 50 * 3.0,
            type: BetType.BACK,
            status: BetStatus.UNMATCHED,
            userId: user2.id,
            eventId: event.id,
            marketId: market.id
          }
        });

        // Update user balance manually
        await prisma.user.update({
          where: { id: user2.id },
          data: {
            balance: 950, // 1000 - 50
            availableBalance: 950 // 1000 - 50
          }
        });

        // Get user balance after bet creation
        const userAfterBet = await prisma.user.findUnique({
          where: { id: user2.id }
        });

        // Cancel the bet
        await betService.cancelUnmatchedBet(bet.id, user2.id);

        // Get user balance after cancellation
        const userAfterCancel = await prisma.user.findUnique({
          where: { id: user2.id }
        });

        // Verify balances
        expect(userAfterCancel?.balance).toBe(userAfterBet?.balance! + 50);
        expect(userAfterCancel?.availableBalance).toBe(userAfterBet?.availableBalance! + 50);

        // Verify transaction was created
        const transactions = await prisma.transaction.findMany({
          where: {
            userId: user2.id,
            type: 'REFUND'
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        });

        expect(transactions.length).toBe(1);
        expect(transactions[0].amount).toBe(50);
        expect(transactions[0].status).toBe('COMPLETADA');
      } finally {
        // Limpiar entorno
        await cleanupTestEnvironment(emails);
      }
    });

    it('should release reserved funds when cancelling a lay bet', async () => {
      // Configurar entorno aislado
      const { user1, user2, event, market, emails } = await setupIsolatedTestEnvironment();

      try {
        // Calculate liability
        const amount = 75;
        const odds = 2.5;
        const liability = amount * (odds - 1); // 75 * (2.5 - 1) = 112.5

        // Create a lay bet directly in the database
        const bet = await prisma.bet.create({
          data: {
            amount: amount,
            odds: odds,
            selection: 'Team C',
            potentialWinnings: amount,
            liability: liability,
            type: BetType.LAY,
            status: BetStatus.UNMATCHED,
            userId: user1.id,
            eventId: event.id,
            marketId: market.id
          }
        });

        // Update user balance manually
        await prisma.user.update({
          where: { id: user1.id },
          data: {
            availableBalance: 1000 - liability,
            reservedBalance: liability
          }
        });

        // Get user balance after bet creation
        const userAfterBet = await prisma.user.findUnique({
          where: { id: user1.id }
        });

        // Cancel the bet
        await betService.cancelUnmatchedBet(bet.id, user1.id);

        // Get user balance after cancellation
        const userAfterCancel = await prisma.user.findUnique({
          where: { id: user1.id }
        });

        // Verify balances
        expect(userAfterCancel?.availableBalance).toBe(userAfterBet?.availableBalance! + liability);
        expect(userAfterCancel?.reservedBalance).toBe(userAfterBet?.reservedBalance! - liability);

        // Verify transaction was created
        const transactions = await prisma.transaction.findMany({
          where: {
            userId: user1.id,
            type: 'RELEASE'
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        });

        expect(transactions.length).toBe(1);
        expect(transactions[0].amount).toBeCloseTo(liability);
        expect(transactions[0].status).toBe('COMPLETADA');
      } finally {
        // Limpiar entorno
        await cleanupTestEnvironment(emails);
      }
    });
  });

  describe('Settling markets', () => {
    it('should update balances when settling a market', async () => {
      // Configurar entorno aislado
      const { user1, user2, event, market, emails } = await setupIsolatedTestEnvironment();

      try {
        // Create bets directly in the database
        const layBetAmount = 100;
        const layBetOdds = 2.0;
        const liability = layBetAmount * (layBetOdds - 1);

        // Create lay bet
        const layBet = await prisma.bet.create({
          data: {
            amount: layBetAmount,
            odds: layBetOdds,
            selection: 'Team D',
            potentialWinnings: layBetAmount,
            liability: liability,
            type: BetType.LAY,
            status: BetStatus.FULLY_MATCHED,
            matchedAmount: layBetAmount,
            userId: user1.id,
            eventId: event.id,
            marketId: market.id
          }
        });

        // Create back bet
        const backBet = await prisma.bet.create({
          data: {
            amount: layBetAmount, // Same amount for simplicity
            odds: layBetOdds, // Same odds for simplicity
            selection: 'Team D',
            potentialWinnings: layBetAmount * layBetOdds,
            type: BetType.BACK,
            status: BetStatus.FULLY_MATCHED,
            matchedAmount: layBetAmount,
            userId: user2.id,
            eventId: event.id,
            marketId: market.id
          }
        });

        // Create a match between the bets
        await prisma.betMatch.create({
          data: {
            amount: layBetAmount,
            odds: layBetOdds,
            backBetId: backBet.id,
            layBetId: layBet.id
          }
        });

        // Update user balances manually
        await prisma.user.update({
          where: { id: user1.id },
          data: {
            reservedBalance: liability
          }
        });

        // Update event to completed
        await prisma.event.update({
          where: { id: event.id },
          data: { status: 'COMPLETED' }
        });

        // Get user balances before settlement
        const user1BeforeSettle = await prisma.user.findUnique({
          where: { id: user1.id }
        });

        const user2BeforeSettle = await prisma.user.findUnique({
          where: { id: user2.id }
        });

        // Settle the market with Team D as winner
        await marketService.settleMarket(market.id, 'Team D');

        // Get user balances after settlement
        const user1AfterSettle = await prisma.user.findUnique({
          where: { id: user1.id }
        });

        const user2AfterSettle = await prisma.user.findUnique({
          where: { id: user2.id }
        });

        // Verify balances
        // User1 (lay bet) should lose since Team D won
        expect(user1AfterSettle?.reservedBalance).toBe(user1BeforeSettle?.reservedBalance! - liability);

        // User2 (back bet) should win
        const winnings = layBetAmount * layBetOdds;
        expect(user2AfterSettle?.balance).toBe(user2BeforeSettle?.balance! + winnings);
        expect(user2AfterSettle?.availableBalance).toBe(user2BeforeSettle?.availableBalance! + winnings);

        // Verify transactions were created
        const winningTransactions = await prisma.transaction.findMany({
          where: {
            userId: user2.id,
            type: 'WINNING'
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        });

        expect(winningTransactions.length).toBe(1);
        expect(winningTransactions[0].amount).toBe(winnings);

        const releaseTransactions = await prisma.transaction.findMany({
          where: {
            userId: user1.id,
            type: 'RELEASE'
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        });

        expect(releaseTransactions.length).toBe(1);
      } finally {
        // Limpiar entorno
        await cleanupTestEnvironment(emails);
      }
    });
  });
});
