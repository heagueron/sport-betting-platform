import { agent, createUser, generateToken } from './utils';
import { prisma } from './setup';

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123'
      };

      const response = await agent
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Check response
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.name).toBe(userData.name);
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data.password).toBeUndefined(); // Password should not be returned
      expect(response.body.token).toBeDefined();

      // Check that user was created in database
      const user = await prisma.user.findUnique({
        where: { email: userData.email }
      });
      expect(user).toBeDefined();
      expect(user?.name).toBe(userData.name);
    });

    it('should return 409 if email is already in use', async () => {
      // Create a user first
      const existingUser = await createUser();

      // Try to register with the same email
      const userData = {
        name: 'Duplicate User',
        email: existingUser.email,
        password: 'password123'
      };

      const response = await agent
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 if required fields are missing', async () => {
      // Missing email
      const response1 = await agent
        .post('/api/auth/register')
        .send({
          name: 'Invalid User',
          password: 'password123'
        })
        .expect(400);

      expect(response1.body.success).toBe(false);
      expect(response1.body.error).toBeDefined();

      // Missing password
      const response2 = await agent
        .post('/api/auth/register')
        .send({
          name: 'Invalid User',
          email: 'invalid@example.com'
        })
        .expect(400);

      expect(response2.body.success).toBe(false);
      expect(response2.body.error).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login a user and return a token', async () => {
      // Create a user
      const password = 'password123';
      const user = await createUser();

      // Login
      const response = await agent
        .post('/api/auth/login')
        .send({
          email: user.email,
          password
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.data.email).toBe(user.email);
    });

    it('should return 401 if credentials are invalid', async () => {
      // Create a user
      const user = await createUser();

      // Login with wrong password
      const response = await agent
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 if required fields are missing', async () => {
      // Missing password
      const response = await agent
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return the current user', async () => {
      // Create a user
      const user = await createUser();
      const token = generateToken(user);

      // Get current user
      const response = await agent
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(user.id);
      expect(response.body.data.email).toBe(user.email);
      expect(response.body.data.password).toBeUndefined(); // Password should not be returned
    });

    it('should return 401 if not authenticated', async () => {
      const response = await agent
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/auth/logout', () => {
    it('should logout a user', async () => {
      const response = await agent
        .get('/api/auth/logout')
        .expect(200);

      expect(response.body.success).toBe(true);

      // Check that cookie is cleared
      const cookies = response.headers['set-cookie'] || [];
      let tokenCookie = '';

      if (Array.isArray(cookies)) {
        const foundCookie = cookies.find((cookie: string) => cookie.startsWith('token='));
        if (foundCookie) tokenCookie = foundCookie;
      } else if (typeof cookies === 'string') {
        if (cookies.startsWith('token=')) tokenCookie = cookies;
      }

      expect(tokenCookie).toBeTruthy();
      expect(tokenCookie).toContain('token=none');
    });
  });
});
