import { agent, createUser, createAdmin, generateToken, createSport, createEvent, createMarket } from './utils';
import { prisma } from './setup';
import { BetType, MarketStatus } from '@prisma/client';

describe('Market API', () => {
  describe('POST /api/markets', () => {
    it('should create a new market when admin is authenticated', async () => {
      // Create an admin, sport, and event
      const admin = await createAdmin();
      const token = generateToken(admin);
      const sport = await createSport();
      const event = await createEvent(sport.id);

      const marketData = {
        eventId: event.id,
        name: 'Match Winner'
      };

      const response = await agent
        .post('/api/markets')
        .set('Authorization', `Bearer ${token}`)
        .send(marketData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.eventId).toBe(event.id);
      expect(response.body.data.name).toBe(marketData.name);
      expect(response.body.data.status).toBe('OPEN');

      // Check that market was created in database
      const market = await prisma.market.findUnique({
        where: { id: response.body.data.id }
      });
      expect(market).toBeDefined();
      expect(market?.eventId).toBe(event.id);
      expect(market?.name).toBe(marketData.name);
    });

    it('should return 401 if not authenticated', async () => {
      // Create a sport and an event
      const sport = await createSport();
      const event = await createEvent(sport.id);

      const marketData = {
        eventId: event.id,
        name: 'Match Winner'
      };

      const response = await agent
        .post('/api/markets')
        .send(marketData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 403 if user is not an admin', async () => {
      // Create a regular user, sport, and event
      const user = await createUser();
      const token = generateToken(user);
      const sport = await createSport();
      const event = await createEvent(sport.id);

      const marketData = {
        eventId: event.id,
        name: 'Match Winner'
      };

      const response = await agent
        .post('/api/markets')
        .set('Authorization', `Bearer ${token}`)
        .send(marketData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 if event does not exist', async () => {
      // Create an admin
      const admin = await createAdmin();
      const token = generateToken(admin);

      const marketData = {
        eventId: '00000000-0000-0000-0000-000000000000',
        name: 'Match Winner'
      };

      const response = await agent
        .post('/api/markets')
        .set('Authorization', `Bearer ${token}`)
        .send(marketData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/events/:id/markets', () => {
    it('should return markets for an event', async () => {
      // Create a sport, event, and markets
      const sport = await createSport();
      const event = await createEvent(sport.id);
      await createMarket(event.id, { name: 'Market 1' });
      await createMarket(event.id, { name: 'Market 2' });

      const response = await agent
        .get(`/api/events/${event.id}/markets`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data.every((market: any) => market.eventId === event.id)).toBe(true);
    });

    it('should return empty array if event has no markets', async () => {
      // Create a sport and event without markets
      const sport = await createSport();
      const event = await createEvent(sport.id);

      const response = await agent
        .get(`/api/events/${event.id}/markets`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    it('should return 404 if event does not exist', async () => {
      const response = await agent
        .get('/api/events/00000000-0000-0000-0000-000000000000/markets')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/markets/:id/orderbook', () => {
    it('should return order book for a market', async () => {
      // Create users, sport, event, market, and bets
      const user1 = await createUser({ balance: 100, availableBalance: 100 });
      const user2 = await createUser({ balance: 100, availableBalance: 100 });
      const sport = await createSport();
      const event = await createEvent(sport.id);
      const market = await createMarket(event.id);
      const selection = event.participants[0].name;

      // Create back bet
      await prisma.bet.create({
        data: {
          userId: user1.id,
          eventId: event.id,
          marketId: market.id,
          amount: 10,
          odds: 2.0,
          selection,
          potentialWinnings: 20,
          type: BetType.BACK,
          status: 'UNMATCHED',
          matchedAmount: 0
        }
      });

      // Create lay bet
      await prisma.bet.create({
        data: {
          userId: user2.id,
          eventId: event.id,
          marketId: market.id,
          amount: 15,
          odds: 2.5,
          selection,
          potentialWinnings: 15,
          type: BetType.LAY,
          liability: 15 * 1.5,
          status: 'UNMATCHED',
          matchedAmount: 0
        }
      });

      const response = await agent
        .get(`/api/markets/${market.id}/orderbook`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.selections).toBeDefined();
      expect(response.body.data.selections[selection]).toBeDefined();
      expect(response.body.data.selections[selection].backBets).toBeDefined();
      expect(response.body.data.selections[selection].layBets).toBeDefined();
      expect(response.body.data.selections[selection].backBets.length).toBe(1);
      expect(response.body.data.selections[selection].layBets.length).toBe(1);
    });

    it('should return 404 if market does not exist', async () => {
      const response = await agent
        .get('/api/markets/00000000-0000-0000-0000-000000000000/orderbook')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('PUT /api/markets/:id/status', () => {
    it('should update market status when admin is authenticated', async () => {
      // Create an admin, sport, event, and market
      const admin = await createAdmin();
      const token = generateToken(admin);
      const sport = await createSport();
      const event = await createEvent(sport.id);
      const market = await createMarket(event.id);

      const statusData = {
        status: 'SUSPENDED'
      };

      const response = await agent
        .put(`/api/markets/${market.id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send(statusData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(market.id);
      expect(response.body.data.status).toBe('SUSPENDED');

      // Check that market was updated in database
      const updatedMarket = await prisma.market.findUnique({
        where: { id: market.id }
      });
      expect(updatedMarket).toBeDefined();
      expect(updatedMarket?.status).toBe('SUSPENDED');
    });

    it('should return 401 if not authenticated', async () => {
      // Create a sport, event, and market
      const sport = await createSport();
      const event = await createEvent(sport.id);
      const market = await createMarket(event.id);

      const statusData = {
        status: 'SUSPENDED'
      };

      const response = await agent
        .put(`/api/markets/${market.id}/status`)
        .send(statusData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 403 if user is not an admin', async () => {
      // Create a regular user, sport, event, and market
      const user = await createUser();
      const token = generateToken(user);
      const sport = await createSport();
      const event = await createEvent(sport.id);
      const market = await createMarket(event.id);

      const statusData = {
        status: 'SUSPENDED'
      };

      const response = await agent
        .put(`/api/markets/${market.id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send(statusData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 if status is invalid', async () => {
      // Create an admin, sport, event, and market
      const admin = await createAdmin();
      const token = generateToken(admin);
      const sport = await createSport();
      const event = await createEvent(sport.id);
      const market = await createMarket(event.id);

      const statusData = {
        status: 'INVALID_STATUS'
      };

      const response = await agent
        .put(`/api/markets/${market.id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send(statusData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
});
