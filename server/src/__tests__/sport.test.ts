import { agent, createUser, createAdmin, generateToken, createSport, createEvent } from './utils';
import { prisma } from './setup';

describe('Sport API', () => {
  describe('POST /api/sports', () => {
    it('should create a new sport when admin is authenticated', async () => {
      // Create an admin user
      const admin = await createAdmin();
      const token = generateToken(admin);

      // Generate a unique sport name
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const sportData = {
        name: `Football ${uniqueId}`,
        active: true
      };

      const response = await agent
        .post('/api/sports')
        .set('Authorization', `Bearer ${token}`)
        .send(sportData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.name).toBe(sportData.name);
      expect(response.body.data.active).toBe(sportData.active);

      // Check that the slug is derived from the name
      const expectedSlug = sportData.name.toLowerCase().replace(/\s+/g, '-');
      expect(response.body.data.slug).toBe(expectedSlug);

      // Check that sport was created in database
      const sport = await prisma.sport.findUnique({
        where: { id: response.body.data.id }
      });
      expect(sport).toBeDefined();
      expect(sport?.name).toBe(sportData.name);
    });

    it('should return 401 if not authenticated', async () => {
      const sportData = {
        name: 'Basketball',
        active: true
      };

      const response = await agent
        .post('/api/sports')
        .send(sportData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 403 if authenticated user is not an admin', async () => {
      // Create a regular user
      const user = await createUser();
      const token = generateToken(user);

      const sportData = {
        name: 'Tennis',
        active: true
      };

      const response = await agent
        .post('/api/sports')
        .set('Authorization', `Bearer ${token}`)
        .send(sportData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 if name is missing', async () => {
      // Create an admin user
      const admin = await createAdmin();
      const token = generateToken(admin);

      const sportData = {
        active: true
      };

      const response = await agent
        .post('/api/sports')
        .set('Authorization', `Bearer ${token}`)
        .send(sportData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/sports', () => {
    it('should return all sports', async () => {
      // Create some sports
      await createSport({ name: 'Football' });
      await createSport({ name: 'Basketball' });
      await createSport({ name: 'Tennis' });

      const response = await agent
        .get('/api/sports')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(3);
    });

    it('should filter sports by active status', async () => {
      // Create active and inactive sports
      const activeSport = await createSport({ name: 'Active Sport', active: true });
      const inactiveSport = await createSport({ name: 'Inactive Sport', active: false });

      // Get active sports
      const response1 = await agent
        .get('/api/sports?active=true')
        .expect(200);

      expect(response1.body.success).toBe(true);
      expect(response1.body.data).toBeDefined();
      expect(Array.isArray(response1.body.data)).toBe(true);

      // Check if our active sport is in the response
      const foundActiveSport = response1.body.data.find((sport: any) => sport.id === activeSport.id);
      expect(foundActiveSport).toBeDefined();
      expect(foundActiveSport.active).toBe(true);

      // Get inactive sports
      const response2 = await agent
        .get('/api/sports?active=false')
        .expect(200);

      expect(response2.body.success).toBe(true);
      expect(response2.body.data).toBeDefined();
      expect(Array.isArray(response2.body.data)).toBe(true);

      // Check if our inactive sport is in the response
      const foundInactiveSport = response2.body.data.find((sport: any) => sport.id === inactiveSport.id);
      expect(foundInactiveSport).toBeDefined();
      expect(foundInactiveSport.active).toBe(false);
    });
  });

  describe('GET /api/sports/:id', () => {
    it('should return a single sport', async () => {
      // Create a sport
      const sport = await createSport({ name: 'Football' });

      const response = await agent
        .get(`/api/sports/${sport.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(sport.id);
      expect(response.body.data.name).toBe(sport.name);
    });

    it('should return 404 if sport does not exist', async () => {
      const response = await agent
        .get('/api/sports/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/sports/:id/events', () => {
    it('should return events for a sport', async () => {
      // Create a sport and events
      const sport = await createSport({ name: 'Football' });
      await createEvent(sport.id, { name: 'Event 1' });
      await createEvent(sport.id, { name: 'Event 2' });

      const response = await agent
        .get(`/api/sports/${sport.id}/events`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      expect(response.body.data.every((event: any) => event.sportId === sport.id)).toBe(true);
    });

    it('should filter events by status', async () => {
      // Create a sport and events with different statuses
      const sport = await createSport({ name: 'Football' });
      await createEvent(sport.id, { name: 'Scheduled Event', status: 'SCHEDULED' });
      await createEvent(sport.id, { name: 'Live Event', status: 'LIVE' });

      // Get scheduled events
      const response = await agent
        .get(`/api/sports/${sport.id}/events?status=SCHEDULED`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.every((event: any) => event.status === 'SCHEDULED')).toBe(true);
    });

    it('should return 404 if sport does not exist', async () => {
      const response = await agent
        .get('/api/sports/00000000-0000-0000-0000-000000000000/events')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('PUT /api/sports/:id', () => {
    it('should update a sport when admin is authenticated', async () => {
      // Create an admin user and a sport
      const admin = await createAdmin();
      const token = generateToken(admin);
      const sport = await createSport({ name: 'Football' });

      const updateData = {
        name: 'Soccer',
        active: false
      };

      const response = await agent
        .put(`/api/sports/${sport.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(sport.id);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.active).toBe(updateData.active);
      expect(response.body.data.slug).toBe('soccer');

      // Check that sport was updated in database
      const updatedSport = await prisma.sport.findUnique({
        where: { id: sport.id }
      });
      expect(updatedSport).toBeDefined();
      expect(updatedSport?.name).toBe(updateData.name);
      expect(updatedSport?.active).toBe(updateData.active);
    });

    it('should return 401 if not authenticated', async () => {
      // Create a sport
      const sport = await createSport({ name: 'Football' });

      const updateData = {
        name: 'Soccer',
        active: false
      };

      const response = await agent
        .put(`/api/sports/${sport.id}`)
        .send(updateData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 403 if authenticated user is not an admin', async () => {
      // Create a regular user and a sport
      const user = await createUser();
      const token = generateToken(user);
      const sport = await createSport({ name: 'Football' });

      const updateData = {
        name: 'Soccer',
        active: false
      };

      const response = await agent
        .put(`/api/sports/${sport.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 404 if sport does not exist', async () => {
      // Create an admin user
      const admin = await createAdmin();
      const token = generateToken(admin);

      const updateData = {
        name: 'Soccer',
        active: false
      };

      const response = await agent
        .put('/api/sports/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('DELETE /api/sports/:id', () => {
    it('should delete a sport when admin is authenticated', async () => {
      // Create an admin user and a sport
      const admin = await createAdmin();
      const token = generateToken(admin);
      const sport = await createSport({ name: 'Football' });

      const response = await agent
        .delete(`/api/sports/${sport.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Check that sport was deleted from database
      const deletedSport = await prisma.sport.findUnique({
        where: { id: sport.id }
      });
      expect(deletedSport).toBeNull();
    });

    it('should return 401 if not authenticated', async () => {
      // Create a sport
      const sport = await createSport({ name: 'Football' });

      const response = await agent
        .delete(`/api/sports/${sport.id}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 403 if authenticated user is not an admin', async () => {
      // Create a regular user and a sport
      const user = await createUser();
      const token = generateToken(user);
      const sport = await createSport({ name: 'Football' });

      const response = await agent
        .delete(`/api/sports/${sport.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 404 if sport does not exist', async () => {
      // Create an admin user
      const admin = await createAdmin();
      const token = generateToken(admin);

      const response = await agent
        .delete('/api/sports/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 if sport has associated events', async () => {
      // Create an admin user, a sport, and an event
      const admin = await createAdmin();
      const token = generateToken(admin);
      const sport = await createSport({ name: 'Football' });
      await createEvent(sport.id, { name: 'Event 1' });

      const response = await agent
        .delete(`/api/sports/${sport.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
});
