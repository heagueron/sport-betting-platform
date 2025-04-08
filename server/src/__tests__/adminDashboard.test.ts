import { agent, createUser, createAdmin, generateToken, createMultipleUsers, createMultipleTransactions } from './utils';
import { prisma } from './setup';
import { TransactionStatus, TransactionType } from '@prisma/client';

describe('Admin Dashboard', () => {
  describe('GET /api/admin/dashboard/stats', () => {
    it('should return basic statistics when admin is authenticated', async () => {
      // Create an admin user
      const admin = await createAdmin();
      const token = generateToken(admin);

      // Create some users and transactions
      const users = await createMultipleUsers(3);
      await createMultipleTransactions(users[0].id, 2);

      const response = await agent
        .get('/api/admin/dashboard/stats')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.totalUsers).toBeGreaterThanOrEqual(4); // 3 users + 1 admin
      expect(response.body.data.totalTransactions).toBeGreaterThanOrEqual(2);
      expect(response.body.data.pendingTransactions).toBeDefined();
      expect(response.body.data.totalDeposits).toBeDefined();
      expect(response.body.data.totalWithdrawals).toBeDefined();
    });

    it('should return 403 when non-admin user tries to access', async () => {
      // Create a regular user
      const user = await createUser();
      const token = generateToken(user);

      const response = await agent
        .get('/api/admin/dashboard/stats')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/admin/dashboard/users/stats', () => {
    it('should return user statistics when admin is authenticated', async () => {
      // Create an admin user
      const admin = await createAdmin();
      const token = generateToken(admin);

      // Create some users
      await createMultipleUsers(3);

      const response = await agent
        .get('/api/admin/dashboard/users/stats')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.totalUsers).toBeGreaterThanOrEqual(4); // 3 users + 1 admin
      expect(response.body.data.adminUsers).toBeGreaterThanOrEqual(1);
      expect(response.body.data.usersByDate).toBeDefined();
      expect(Array.isArray(response.body.data.usersByDate)).toBe(true);
    });
  });

  describe('GET /api/admin/dashboard/transactions/stats', () => {
    it('should return transaction statistics when admin is authenticated', async () => {
      // Create an admin user
      const admin = await createAdmin();
      const token = generateToken(admin);

      // Create a user with transactions
      const user = await createUser();
      await createMultipleTransactions(user.id, 2, { status: TransactionStatus.PENDING });
      await createMultipleTransactions(user.id, 1, { status: TransactionStatus.COMPLETADA });

      const response = await agent
        .get('/api/admin/dashboard/transactions/stats')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.totalAmount).toBeDefined();
      expect(response.body.data.byStatus).toBeDefined();
      expect(Array.isArray(response.body.data.byStatus)).toBe(true);
      expect(response.body.data.byType).toBeDefined();
      expect(Array.isArray(response.body.data.byType)).toBe(true);
      expect(response.body.data.recentTransactions).toBeDefined();
      expect(Array.isArray(response.body.data.recentTransactions)).toBe(true);
    });
  });
});
