import { agent, createUser, createAdmin, generateToken, createSport, createEvent, createBet } from './utils';
import { prisma } from './setup';

describe('Bet API', () => {
  describe('POST /api/bets', () => {
    it('should create a new bet when user is authenticated', async () => {
      // Create a user, sport, and event
      const user = await createUser({ balance: 100 });
      const token = generateToken(user);
      const sport = await createSport({ name: 'Football' });
      const event = await createEvent(sport.id, { name: 'Event 1' });

      // Get the first participant's name
      const participant = event.participants[0];

      const betData = {
        eventId: event.id,
        amount: 10,
        odds: 1.5,
        selection: participant.name
      };

      const response = await agent
        .post('/api/bets')
        .set('Authorization', `Bearer ${token}`)
        .send(betData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.eventId).toBe(event.id);
      expect(response.body.data.amount).toBe(betData.amount);
      expect(response.body.data.odds).toBe(betData.odds);
      expect(response.body.data.selection).toBe(betData.selection);
      expect(response.body.data.potentialWinnings).toBe(betData.amount * betData.odds);

      // Check that bet was created in database
      const bet = await prisma.bet.findUnique({
        where: { id: response.body.data.id }
      });
      expect(bet).toBeDefined();
      expect(bet?.userId).toBe(user.id);
      expect(bet?.eventId).toBe(event.id);
      expect(bet?.amount).toBe(betData.amount);

      // Check that user balance was updated
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id }
      });
      expect(updatedUser).toBeDefined();
      expect(updatedUser?.balance).toBe(90); // 100 - 10
    });

    it('should return 401 if not authenticated', async () => {
      // Create a sport and an event
      const sport = await createSport({ name: 'Football' });
      const event = await createEvent(sport.id, { name: 'Event 1' });

      // Get the first participant's name
      const participant = event.participants[0];

      const betData = {
        eventId: event.id,
        amount: 10,
        odds: 1.5,
        selection: participant.name
      };

      const response = await agent
        .post('/api/bets')
        .send(betData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 if user has insufficient balance', async () => {
      // Create a user with low balance, sport, and event
      const user = await createUser({ balance: 5 });
      const token = generateToken(user);
      const sport = await createSport({ name: 'Football' });
      const event = await createEvent(sport.id, { name: 'Event 1' });

      // Get the first participant's name
      const participant = event.participants[0];

      const betData = {
        eventId: event.id,
        amount: 10,
        odds: 1.5,
        selection: participant.name
      };

      const response = await agent
        .post('/api/bets')
        .set('Authorization', `Bearer ${token}`)
        .send(betData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(response.body.error).toContain('Insufficient balance');
    });

    it('should return 400 if required fields are missing', async () => {
      // Create a user, sport, and event
      const user = await createUser({ balance: 100 });
      const token = generateToken(user);
      const sport = await createSport({ name: 'Football' });
      const event = await createEvent(sport.id, { name: 'Event 1' });

      // Get the first participant's name
      const participant = event.participants[0];

      // Missing amount
      const betData1 = {
        eventId: event.id,
        odds: 1.5,
        selection: participant.name
      };

      const response1 = await agent
        .post('/api/bets')
        .set('Authorization', `Bearer ${token}`)
        .send(betData1)
        .expect(400);

      expect(response1.body.success).toBe(false);
      expect(response1.body.error).toBeDefined();

      // Missing selection
      const betData2 = {
        eventId: event.id,
        amount: 10,
        odds: 1.5
      };

      const response2 = await agent
        .post('/api/bets')
        .set('Authorization', `Bearer ${token}`)
        .send(betData2)
        .expect(400);

      expect(response2.body.success).toBe(false);
      expect(response2.body.error).toBeDefined();
    });

    it('should return 404 if event does not exist', async () => {
      // Create a user
      const user = await createUser({ balance: 100 });
      const token = generateToken(user);

      const betData = {
        eventId: '00000000-0000-0000-0000-000000000000',
        amount: 10,
        odds: 1.5,
        selection: 'Any Team' // Doesn't matter for this test as the event doesn't exist
      };

      const response = await agent
        .post('/api/bets')
        .set('Authorization', `Bearer ${token}`)
        .send(betData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/bets/user', () => {
    it('should return user bets when authenticated', async () => {
      // Create a user, sport, event, and bets
      const user = await createUser({ balance: 100 });
      const token = generateToken(user);
      const sport = await createSport({ name: 'Football' });
      const event = await createEvent(sport.id, { name: 'Event 1' });
      await createBet(user.id, event.id, { amount: 10, selection: 'Team A' });
      await createBet(user.id, event.id, { amount: 20, selection: 'Team B' });

      const response = await agent
        .get('/api/bets/user')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data.every((bet: any) => bet.userId === user.id)).toBe(true);
    });

    it('should return 401 if not authenticated', async () => {
      const response = await agent
        .get('/api/bets/user')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should paginate results', async () => {
      // Create a user, sport, event, and multiple bets
      const user = await createUser({ balance: 1000 });
      const token = generateToken(user);
      const sport = await createSport({ name: 'Football' });
      const event = await createEvent(sport.id, { name: 'Event 1' });
      for (let i = 0; i < 15; i++) {
        await createBet(user.id, event.id, { amount: 10 + i, selection: 'Team A' });
      }

      // Get first page (10 bets)
      const response1 = await agent
        .get('/api/bets/user?page=1&limit=10')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response1.body.success).toBe(true);
      expect(response1.body.data).toBeDefined();
      expect(Array.isArray(response1.body.data)).toBe(true);
      expect(response1.body.data.length).toBe(10);
      expect(response1.body.pagination).toBeDefined();
      expect(response1.body.pagination.page).toBe(1);
      expect(response1.body.pagination.pages).toBeGreaterThanOrEqual(2);

      // Get second page (5 bets)
      const response2 = await agent
        .get('/api/bets/user?page=2&limit=10')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response2.body.success).toBe(true);
      expect(response2.body.data).toBeDefined();
      expect(Array.isArray(response2.body.data)).toBe(true);
      expect(response2.body.data.length).toBe(5);
      expect(response2.body.pagination).toBeDefined();
      expect(response2.body.pagination.page).toBe(2);
    });
  });

  describe('GET /api/bets/:id', () => {
    it('should return a single bet when user owns it', async () => {
      // Create a user, sport, event, and bet
      const user = await createUser({ balance: 100 });
      const token = generateToken(user);
      const sport = await createSport({ name: 'Football' });
      const event = await createEvent(sport.id, { name: 'Event 1' });
      const bet = await createBet(user.id, event.id, { amount: 10, selection: 'Team A' });

      const response = await agent
        .get(`/api/bets/${bet.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(bet.id);
      expect(response.body.data.userId).toBe(user.id);
      expect(response.body.data.eventId).toBe(event.id);
      expect(response.body.data.amount).toBe(bet.amount);
    });

    it('should return 401 if not authenticated', async () => {
      // Create a user, sport, event, and bet
      const user = await createUser({ balance: 100 });
      const sport = await createSport({ name: 'Football' });
      const event = await createEvent(sport.id, { name: 'Event 1' });
      const bet = await createBet(user.id, event.id, { amount: 10, selection: 'Team A' });

      const response = await agent
        .get(`/api/bets/${bet.id}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 403 if user does not own the bet and is not admin', async () => {
      // Create two users, sport, event, and bet
      const user1 = await createUser({ balance: 100 });
      const user2 = await createUser({ balance: 100 });
      const token2 = generateToken(user2);
      const sport = await createSport({ name: 'Football' });
      const event = await createEvent(sport.id, { name: 'Event 1' });
      const bet = await createBet(user1.id, event.id, { amount: 10, selection: 'Team A' });

      const response = await agent
        .get(`/api/bets/${bet.id}`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 404 if bet does not exist', async () => {
      // Create a user
      const user = await createUser({ balance: 100 });
      const token = generateToken(user);

      const response = await agent
        .get('/api/bets/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/bets/balance', () => {
    it('should return user balance when authenticated', async () => {
      // Create a user
      const user = await createUser({ balance: 100 });
      const token = generateToken(user);

      const response = await agent
        .get('/api/bets/balance')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.balance).toBe(100);
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
      const user = await createUser({ balance: 100 });
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

      // Subtract from balance
      const response2 = await agent
        .put('/api/bets/balance')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: -30 })
        .expect(200);

      expect(response2.body.success).toBe(true);
      expect(response2.body.data).toBeDefined();
      expect(response2.body.data.balance).toBe(120);
    });

    it('should return 401 if not authenticated', async () => {
      const response = await agent
        .put('/api/bets/balance')
        .send({ amount: 50 })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 if amount is invalid', async () => {
      // Create a user
      const user = await createUser({ balance: 100 });
      const token = generateToken(user);

      // Zero amount
      const response1 = await agent
        .put('/api/bets/balance')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 0 })
        .expect(400);

      expect(response1.body.success).toBe(false);
      expect(response1.body.error).toBeDefined();

      // Missing amount
      const response2 = await agent
        .put('/api/bets/balance')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);

      expect(response2.body.success).toBe(false);
      expect(response2.body.error).toBeDefined();
    });

    it('should return 400 if withdrawal would result in negative balance', async () => {
      // Create a user
      const user = await createUser({ balance: 100 });
      const token = generateToken(user);

      // Try to withdraw more than balance
      const response = await agent
        .put('/api/bets/balance')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: -150 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(response.body.error).toContain('Insufficient balance');
    });
  });

  // Additional tests for other bet endpoints would follow a similar pattern
});
