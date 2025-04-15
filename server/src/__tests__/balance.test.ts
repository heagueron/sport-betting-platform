import { prisma } from './setup';
import { agent, createUser, generateToken } from './utils';

describe('Balance API', () => {
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

    it('should return 400 if amount is invalid', async () => {
      // Create a user
      const user = await createUser({
        balance: 100,
        availableBalance: 100,
        reservedBalance: 0
      });
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
      const user = await createUser({
        balance: 100,
        availableBalance: 100,
        reservedBalance: 0
      });
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
});
