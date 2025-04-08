import { agent, createUser, createAdmin, generateToken, createMultipleUsers } from './utils';
import { prisma } from './setup';
import { Role } from '@prisma/client';

describe('Admin User Management', () => {
  describe('GET /api/admin/users', () => {
    it('should return a list of users when admin is authenticated', async () => {
      // Create an admin user
      const admin = await createAdmin();
      const token = generateToken(admin);

      // Create some regular users
      await createMultipleUsers(3);

      const response = await agent
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(3);
      expect(response.body.pagination).toBeDefined();
    });

    it('should support pagination', async () => {
      // Create an admin user
      const admin = await createAdmin();
      const token = generateToken(admin);

      // Create some regular users
      await createMultipleUsers(5);

      // Get first page (limit 2)
      const response1 = await agent
        .get('/api/admin/users?page=1&limit=2')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response1.body.success).toBe(true);
      expect(response1.body.data).toBeDefined();
      expect(Array.isArray(response1.body.data)).toBe(true);
      expect(response1.body.data.length).toBeLessThanOrEqual(2);
      expect(response1.body.pagination).toBeDefined();

      // Get second page
      const response2 = await agent
        .get('/api/admin/users?page=2&limit=2')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response2.body.success).toBe(true);
      expect(response2.body.data).toBeDefined();
      expect(Array.isArray(response2.body.data)).toBe(true);
      expect(response2.body.data.length).toBeLessThanOrEqual(2);
      expect(response2.body.pagination).toBeDefined();
    });

    it('should return 403 when non-admin user tries to access', async () => {
      // Create a regular user
      const user = await createUser();
      const token = generateToken(user);

      const response = await agent
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/admin/users/:id', () => {
    it('should return a single user when admin is authenticated', async () => {
      // Create an admin user
      const admin = await createAdmin();
      const token = generateToken(admin);

      // Create a regular user
      const user = await createUser();

      const response = await agent
        .get(`/api/admin/users/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(user.id);
      expect(response.body.data.email).toBe(user.email);
    });

    it('should return 404 if user does not exist', async () => {
      // Create an admin user
      const admin = await createAdmin();
      const token = generateToken(admin);

      const response = await agent
        .get('/api/admin/users/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('PUT /api/admin/users/:id', () => {
    it('should update a user when admin is authenticated', async () => {
      // Create an admin user
      const admin = await createAdmin();
      const token = generateToken(admin);

      // Create a regular user
      const user = await createUser();

      const updatedData = {
        name: 'Updated Name',
        email: `updated-${Date.now()}@example.com`
      };

      const response = await agent
        .put(`/api/admin/users/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(user.id);
      expect(response.body.data.name).toBe(updatedData.name);
      expect(response.body.data.email).toBe(updatedData.email);

      // Verify user was updated in database
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id }
      });
      expect(updatedUser?.name).toBe(updatedData.name);
      expect(updatedUser?.email).toBe(updatedData.email);
    });

    it('should return 400 if no fields are provided', async () => {
      // Create an admin user
      const admin = await createAdmin();
      const token = generateToken(admin);

      // Create a regular user
      const user = await createUser();

      const response = await agent
        .put(`/api/admin/users/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('PATCH /api/admin/users/:id/role', () => {
    it('should update a user role when admin is authenticated', async () => {
      // Create an admin user
      const admin = await createAdmin();
      const token = generateToken(admin);

      // Create a regular user
      const user = await createUser();

      const response = await agent
        .patch(`/api/admin/users/${user.id}/role`)
        .set('Authorization', `Bearer ${token}`)
        .send({ role: Role.ADMIN })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(user.id);
      expect(response.body.data.role).toBe(Role.ADMIN);

      // Verify user role was updated in database
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id }
      });
      expect(updatedUser?.role).toBe(Role.ADMIN);
    });

    it('should return 400 if role is invalid', async () => {
      // Create an admin user
      const admin = await createAdmin();
      const token = generateToken(admin);

      // Create a regular user
      const user = await createUser();

      const response = await agent
        .patch(`/api/admin/users/${user.id}/role`)
        .set('Authorization', `Bearer ${token}`)
        .send({ role: 'INVALID_ROLE' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
});
