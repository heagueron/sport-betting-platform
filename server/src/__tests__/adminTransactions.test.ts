import { agent, createUser, createAdmin, generateToken, createTransaction, createMultipleTransactions } from './utils';
import { prisma } from './setup';
import { TransactionStatus, TransactionType } from '@prisma/client';

describe('Admin Transaction Management', () => {
  describe('GET /api/admin/transactions', () => {
    it('should return a list of transactions when admin is authenticated', async () => {
      // Create an admin user
      const admin = await createAdmin();
      const token = generateToken(admin);

      // Create a user with transactions
      const user = await createUser();
      await createMultipleTransactions(user.id, 3);

      const response = await agent
        .get('/api/admin/transactions')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(3);
      expect(response.body.pagination).toBeDefined();
    });

    it('should support filtering by status', async () => {
      // Create an admin user
      const admin = await createAdmin();
      const token = generateToken(admin);

      // Create a user with transactions of different statuses
      const user = await createUser();
      await createMultipleTransactions(user.id, 2, { status: TransactionStatus.PENDING });
      await createMultipleTransactions(user.id, 1, { status: TransactionStatus.APROBADA });

      // Filter by PENDING status
      const response = await agent
        .get(`/api/admin/transactions?status=${TransactionStatus.PENDING}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      
      // All returned transactions should have PENDING status
      response.body.data.forEach((transaction: any) => {
        expect(transaction.status).toBe(TransactionStatus.PENDING);
      });
    });

    it('should return 403 when non-admin user tries to access', async () => {
      // Create a regular user
      const user = await createUser();
      const token = generateToken(user);

      const response = await agent
        .get('/api/admin/transactions')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/admin/transactions/:id', () => {
    it('should return a single transaction when admin is authenticated', async () => {
      // Create an admin user
      const admin = await createAdmin();
      const token = generateToken(admin);

      // Create a user with a transaction
      const user = await createUser();
      const transaction = await createTransaction(user.id);

      const response = await agent
        .get(`/api/admin/transactions/${transaction.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(transaction.id);
      expect(response.body.data.userId).toBe(user.id);
    });

    it('should return 404 if transaction does not exist', async () => {
      // Create an admin user
      const admin = await createAdmin();
      const token = generateToken(admin);

      const response = await agent
        .get('/api/admin/transactions/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('PATCH /api/admin/transactions/:id/approve', () => {
    it('should approve a pending transaction', async () => {
      // Create an admin user
      const admin = await createAdmin();
      const token = generateToken(admin);

      // Create a user with a pending transaction
      const user = await createUser();
      const transaction = await createTransaction(user.id, { status: TransactionStatus.PENDING });

      const response = await agent
        .patch(`/api/admin/transactions/${transaction.id}/approve`)
        .set('Authorization', `Bearer ${token}`)
        .send({ notes: 'Approved by admin' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(transaction.id);
      expect(response.body.data.status).toBe(TransactionStatus.APROBADA);
      expect(response.body.data.notes).toBe('Approved by admin');

      // Verify transaction was updated in database
      const updatedTransaction = await prisma.transaction.findUnique({
        where: { id: transaction.id }
      });
      expect(updatedTransaction?.status).toBe(TransactionStatus.APROBADA);
    });

    it('should return 400 if transaction is not in PENDING status', async () => {
      // Create an admin user
      const admin = await createAdmin();
      const token = generateToken(admin);

      // Create a user with a completed transaction
      const user = await createUser();
      const transaction = await createTransaction(user.id, { status: TransactionStatus.COMPLETADA });

      const response = await agent
        .patch(`/api/admin/transactions/${transaction.id}/approve`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('PATCH /api/admin/transactions/:id/reject', () => {
    it('should reject a pending transaction', async () => {
      // Create an admin user
      const admin = await createAdmin();
      const token = generateToken(admin);

      // Create a user with a pending transaction
      const user = await createUser();
      const transaction = await createTransaction(user.id, { status: TransactionStatus.PENDING });

      const response = await agent
        .patch(`/api/admin/transactions/${transaction.id}/reject`)
        .set('Authorization', `Bearer ${token}`)
        .send({ notes: 'Rejected by admin' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(transaction.id);
      expect(response.body.data.status).toBe(TransactionStatus.FALLIDA);
      expect(response.body.data.notes).toBe('Rejected by admin');

      // Verify transaction was updated in database
      const updatedTransaction = await prisma.transaction.findUnique({
        where: { id: transaction.id }
      });
      expect(updatedTransaction?.status).toBe(TransactionStatus.FALLIDA);
    });

    it('should return 400 if notes are not provided', async () => {
      // Create an admin user
      const admin = await createAdmin();
      const token = generateToken(admin);

      // Create a user with a pending transaction
      const user = await createUser();
      const transaction = await createTransaction(user.id, { status: TransactionStatus.PENDING });

      const response = await agent
        .patch(`/api/admin/transactions/${transaction.id}/reject`)
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
});
