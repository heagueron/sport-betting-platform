import { agent, createUser, createAdmin, generateToken } from './utils';
import { prisma } from './setup';

describe('Admin Authentication', () => {
  describe('GET /api/admin/auth/me', () => {
    it('should return admin user details when admin is authenticated', async () => {
      // Create an admin user
      const admin = await createAdmin();
      const token = generateToken(admin);

      const response = await agent
        .get('/api/admin/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(admin.id);
      expect(response.body.data.role).toBe('ADMIN');
    });

    it('should return 403 when non-admin user tries to access', async () => {
      // Create a regular user
      const user = await createUser();
      const token = generateToken(user);

      const response = await agent
        .get('/api/admin/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 401 when no token is provided', async () => {
      const response = await agent
        .get('/api/admin/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
});
