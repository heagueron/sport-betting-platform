import { BetType, MarketStatus } from '@prisma/client';
import { prisma } from './setup';
import { agent, createUser, createAdmin, generateToken, createSport, createEvent } from './utils';

// Helper function to create a market
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

describe('Betting Exchange API', () => {
  describe('POST /api/bets/back', () => {
    it('should create a new back bet when user is authenticated', async () => {
      // Create a user, sport, event, and market
      const user = await createUser({ balance: 100, availableBalance: 100 });
      const token = generateToken(user);
      const sport = await createSport();
      const event = await createEvent(sport.id);
      const market = await createMarket(event.id);

      // Get the first participant's name
      const participant = event.participants[0];

      const betData = {
        eventId: event.id,
        marketId: market.id,
        amount: 10,
        odds: 1.5,
        selection: participant.name
      };

      const response = await agent
        .post('/api/bets/back')
        .set('Authorization', `Bearer ${token}`)
        .send(betData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.eventId).toBe(event.id);
      expect(response.body.data.marketId).toBe(market.id);
      expect(response.body.data.amount).toBe(betData.amount);
      expect(response.body.data.odds).toBe(betData.odds);
      expect(response.body.data.selection).toBe(betData.selection);
      expect(response.body.data.type).toBe('BACK');
      expect(response.body.data.potentialWinnings).toBe(betData.amount * betData.odds);

      // Check that bet was created in database
      const bet = await prisma.bet.findUnique({
        where: { id: response.body.data.id }
      });
      expect(bet).toBeDefined();
      expect(bet?.userId).toBe(user.id);
      expect(bet?.eventId).toBe(event.id);
      expect(bet?.marketId).toBe(market.id);
      expect(bet?.amount).toBe(betData.amount);
      expect(bet?.type).toBe('BACK');

      // Check that user balance was updated
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id }
      });
      expect(updatedUser).toBeDefined();
      expect(updatedUser?.balance).toBe(90); // 100 - 10
      expect(updatedUser?.availableBalance).toBe(90); // 100 - 10
    });

    it('should return 401 if not authenticated', async () => {
      // Create a sport, event, and market
      const sport = await createSport();
      const event = await createEvent(sport.id);
      const market = await createMarket(event.id);

      // Get the first participant's name
      const participant = event.participants[0];

      const betData = {
        eventId: event.id,
        marketId: market.id,
        amount: 10,
        odds: 1.5,
        selection: participant.name
      };

      const response = await agent
        .post('/api/bets/back')
        .send(betData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 if user has insufficient balance', async () => {
      // Create a user with low balance, sport, event, and market
      const user = await createUser({ balance: 5, availableBalance: 5 });
      const token = generateToken(user);
      const sport = await createSport();
      const event = await createEvent(sport.id);
      const market = await createMarket(event.id);

      // Get the first participant's name
      const participant = event.participants[0];

      const betData = {
        eventId: event.id,
        marketId: market.id,
        amount: 10,
        odds: 1.5,
        selection: participant.name
      };

      const response = await agent
        .post('/api/bets/back')
        .set('Authorization', `Bearer ${token}`)
        .send(betData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(response.body.error).toContain('Insufficient balance');
    });
  });

  describe('POST /api/bets/lay', () => {
    it('should create a new lay bet when user is authenticated', async () => {
      // Create a user, sport, event, and market
      const user = await createUser({ balance: 100, availableBalance: 100 });
      const token = generateToken(user);
      const sport = await createSport();
      const event = await createEvent(sport.id);
      const market = await createMarket(event.id);

      // Get the first participant's name
      const participant = event.participants[0];

      const betData = {
        eventId: event.id,
        marketId: market.id,
        amount: 10,
        odds: 2.0,
        selection: participant.name
      };

      // Calculate expected liability
      const liability = betData.amount * (betData.odds - 1); // 10 * (2.0 - 1) = 10

      const response = await agent
        .post('/api/bets/lay')
        .set('Authorization', `Bearer ${token}`)
        .send(betData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.eventId).toBe(event.id);
      expect(response.body.data.marketId).toBe(market.id);
      expect(response.body.data.amount).toBe(betData.amount);
      expect(response.body.data.odds).toBe(betData.odds);
      expect(response.body.data.selection).toBe(betData.selection);
      expect(response.body.data.type).toBe('LAY');
      expect(response.body.data.liability).toBe(liability);
      expect(response.body.data.potentialWinnings).toBe(betData.amount); // For lay bets, potential winnings is the stake

      // Check that bet was created in database
      const bet = await prisma.bet.findUnique({
        where: { id: response.body.data.id }
      });
      expect(bet).toBeDefined();
      expect(bet?.userId).toBe(user.id);
      expect(bet?.eventId).toBe(event.id);
      expect(bet?.marketId).toBe(market.id);
      expect(bet?.amount).toBe(betData.amount);
      expect(bet?.type).toBe('LAY');
      expect(bet?.liability).toBe(liability);

      // Check that user balance was updated
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id }
      });
      expect(updatedUser).toBeDefined();
      expect(updatedUser?.balance).toBe(100); // Balance remains the same
      expect(updatedUser?.availableBalance).toBe(90); // 100 - 10 (liability)
      expect(updatedUser?.reservedBalance).toBe(10); // 0 + 10 (liability)
    });

    it('should return 400 if user has insufficient balance to cover liability', async () => {
      // Create a user with low balance, sport, event, and market
      const user = await createUser({ balance: 100, availableBalance: 5 });
      const token = generateToken(user);
      const sport = await createSport();
      const event = await createEvent(sport.id);
      const market = await createMarket(event.id);

      // Get the first participant's name
      const participant = event.participants[0];

      const betData = {
        eventId: event.id,
        marketId: market.id,
        amount: 10,
        odds: 2.0,
        selection: participant.name
      };

      // Liability would be 10 * (2.0 - 1) = 10, which is more than available balance

      const response = await agent
        .post('/api/bets/lay')
        .set('Authorization', `Bearer ${token}`)
        .send(betData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(response.body.error).toContain('Insufficient balance');
    });
  });

  describe('PUT /api/bets/:id/cancel', () => {
    it('should cancel an unmatched back bet', async () => {
      // Create a user, sport, event, market, and bet
      const user = await createUser({ balance: 90, availableBalance: 90 });
      const token = generateToken(user);
      const sport = await createSport();
      const event = await createEvent(sport.id);
      const market = await createMarket(event.id);

      // Create an unmatched back bet
      const bet = await prisma.bet.create({
        data: {
          userId: user.id,
          eventId: event.id,
          marketId: market.id,
          amount: 10,
          odds: 1.5,
          selection: event.participants[0].name,
          potentialWinnings: 15,
          type: BetType.BACK,
          status: 'UNMATCHED',
          matchedAmount: 0
        }
      });

      const response = await agent
        .put(`/api/bets/${bet.id}/cancel`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(bet.id);
      expect(response.body.data.status).toBe('CANCELLED');

      // Check that bet was updated in database
      const updatedBet = await prisma.bet.findUnique({
        where: { id: bet.id }
      });
      expect(updatedBet).toBeDefined();
      expect(updatedBet?.status).toBe('CANCELLED');

      // Check that user balance was refunded
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id }
      });
      expect(updatedUser).toBeDefined();
      expect(updatedUser?.balance).toBe(100); // 90 + 10 (refund)
      expect(updatedUser?.availableBalance).toBe(100); // 90 + 10 (refund)
    });
  });

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
});
