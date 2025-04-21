import { agent, createUser, createAdmin, generateToken, createSport, createEvent } from './utils';
import { prisma } from './setup';

describe('Event API', () => {
  describe('POST /api/events', () => {
    it('should create a new event when admin is authenticated', async () => {
      // Create an admin user and a sport
      const admin = await createAdmin();
      const token = generateToken(admin);
      const sport = await createSport({ name: 'Football' });

      const eventData = {
        name: 'Team A vs Team B',
        sportId: sport.id,
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        participants: [
          { name: 'Team A' },
          { name: 'Team B' }
        ]
      };

      const response = await agent
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send(eventData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.name).toBe(eventData.name);
      expect(response.body.data.sportId).toBe(sport.id);
      expect(response.body.data.participants).toBeDefined();
      expect(response.body.data.participants.length).toBe(2);

      // Check that event was created in database
      const event = await prisma.event.findUnique({
        where: { id: response.body.data.id },
        include: { participants: true }
      });
      expect(event).toBeDefined();
      expect(event?.name).toBe(eventData.name);
      expect(event?.participants.length).toBe(2);
    });

    it('should return 401 if not authenticated', async () => {
      // Create a sport
      const sport = await createSport({ name: 'Football' });

      const eventData = {
        name: 'Team A vs Team B',
        sportId: sport.id,
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        participants: [
          { name: 'Team A' },
          { name: 'Team B' }
        ]
      };

      const response = await agent
        .post('/api/events')
        .send(eventData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 403 if authenticated user is not an admin', async () => {
      // Create a regular user and a sport
      const user = await createUser();
      const token = generateToken(user);
      const sport = await createSport({ name: 'Football' });

      const eventData = {
        name: 'Team A vs Team B',
        sportId: sport.id,
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        participants: [
          { name: 'Team A' },
          { name: 'Team B' }
        ]
      };

      const response = await agent
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send(eventData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 if required fields are missing', async () => {
      // Create an admin user and a sport
      const admin = await createAdmin();
      const token = generateToken(admin);
      const sport = await createSport({ name: 'Football' });

      // Missing name
      const eventData1 = {
        sportId: sport.id,
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        participants: [
          { name: 'Team A' },
          { name: 'Team B' }
        ]
      };

      const response1 = await agent
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send(eventData1)
        .expect(400);

      expect(response1.body.success).toBe(false);
      expect(response1.body.error).toBeDefined();

      // Missing participants
      const eventData2 = {
        name: 'Team A vs Team B',
        sportId: sport.id,
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      const response2 = await agent
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send(eventData2)
        .expect(400);

      expect(response2.body.success).toBe(false);
      expect(response2.body.error).toBeDefined();
    });

    it('should return 404 if sport does not exist', async () => {
      // Create an admin user
      const admin = await createAdmin();
      const token = generateToken(admin);

      const eventData = {
        name: 'Team A vs Team B',
        sportId: '00000000-0000-0000-0000-000000000000',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        participants: [
          { name: 'Team A' },
          { name: 'Team B' }
        ]
      };

      const response = await agent
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send(eventData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should validate HEAD_TO_HEAD events have exactly 2 participants', async () => {
      // Create an admin user and a sport
      const admin = await createAdmin();
      const token = generateToken(admin);
      const sport = await createSport({ name: 'Football' });

      // Try to create a HEAD_TO_HEAD event with 3 participants
      const eventData = {
        name: 'Invalid HEAD_TO_HEAD Event',
        sportId: sport.id,
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        format: 'HEAD_TO_HEAD',
        participants: [
          { name: 'Team A' },
          { name: 'Team B' },
          { name: 'Team C' }
        ]
      };

      const response = await agent
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send(eventData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('HEAD_TO_HEAD events must have exactly 2 participants');
    });

    it('should validate MULTI_PARTICIPANT events have at least 3 participants', async () => {
      // Create an admin user and a sport
      const admin = await createAdmin();
      const token = generateToken(admin);
      const sport = await createSport({ name: 'Football' });

      // Try to create a MULTI_PARTICIPANT event with only 2 participants
      const eventData = {
        name: 'Invalid MULTI_PARTICIPANT Event',
        sportId: sport.id,
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        format: 'MULTI_PARTICIPANT',
        participants: [
          { name: 'Team A' },
          { name: 'Team B' }
        ]
      };

      const response = await agent
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send(eventData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('MULTI_PARTICIPANT events must have at least 3 participants');
    });
  });

  describe('GET /api/events', () => {
    it('should return all events', async () => {
      // Create a sport and events
      const sport = await createSport({ name: 'Football' });
      await createEvent(sport.id, { name: 'Event 1' });
      await createEvent(sport.id, { name: 'Event 2' });

      const response = await agent
        .get('/api/events')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter events by status', async () => {
      // Create a sport and events with different statuses
      const sport = await createSport({ name: 'Football' });
      await createEvent(sport.id, { name: 'Scheduled Event', status: 'SCHEDULED' });
      await createEvent(sport.id, { name: 'Live Event', status: 'LIVE' });

      // Get scheduled events
      const response = await agent
        .get('/api/events?status=SCHEDULED')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.every((event: any) => event.status === 'SCHEDULED')).toBe(true);
    });

    it('should filter events by sport', async () => {
      // Create sports and events
      const sport1 = await createSport({ name: 'Football' });
      const sport2 = await createSport({ name: 'Basketball' });
      await createEvent(sport1.id, { name: 'Football Event' });
      await createEvent(sport2.id, { name: 'Basketball Event' });

      // Get football events
      const response = await agent
        .get(`/api/events?sportId=${sport1.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.every((event: any) => event.sportId === sport1.id)).toBe(true);
    });

    it('should paginate results', async () => {
      // Create a sport and multiple events
      const sport = await createSport({ name: 'Football' });
      for (let i = 0; i < 15; i++) {
        await createEvent(sport.id, { name: `Event ${i + 1}` });
      }

      // Get first page (10 events)
      const response1 = await agent
        .get('/api/events?page=1&limit=10')
        .expect(200);

      expect(response1.body.success).toBe(true);
      expect(response1.body.data).toBeDefined();
      expect(Array.isArray(response1.body.data)).toBe(true);
      expect(response1.body.data.length).toBe(10);
      expect(response1.body.pagination).toBeDefined();
      expect(response1.body.pagination.page).toBe(1);
      expect(response1.body.pagination.pages).toBeGreaterThanOrEqual(2);

      // Get second page (5 events)
      const response2 = await agent
        .get('/api/events?page=2&limit=10')
        .expect(200);

      expect(response2.body.success).toBe(true);
      expect(response2.body.data).toBeDefined();
      expect(Array.isArray(response2.body.data)).toBe(true);
      expect(response2.body.data.length).toBeGreaterThanOrEqual(5);
      expect(response2.body.pagination).toBeDefined();
      expect(response2.body.pagination.page).toBe(2);
    });
  });

  describe('GET /api/events/:id', () => {
    it('should return a single event', async () => {
      // Create a sport and an event
      const sport = await createSport({ name: 'Football' });
      const event = await createEvent(sport.id, { name: 'Event 1' });

      const response = await agent
        .get(`/api/events/${event.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(event.id);
      expect(response.body.data.name).toBe(event.name);
      expect(response.body.data.participants).toBeDefined();
      expect(response.body.data.participants.length).toBe(2);
    });

    it('should return 404 if event does not exist', async () => {
      const response = await agent
        .get('/api/events/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('PUT /api/events/:id', () => {
    it('should update an event when admin is authenticated', async () => {
      // Create an admin user, a sport, and an event
      const admin = await createAdmin();
      const token = generateToken(admin);
      const sport = await createSport({ name: 'Football' });
      const event = await createEvent(sport.id, { name: 'Original Event Name' });

      const updateData = {
        name: 'Updated Event Name',
        startTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() // 2 days from now
      };

      const response = await agent
        .put(`/api/events/${event.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.name).toBe(updateData.name);

      // Check that event was updated in database
      const updatedEvent = await prisma.event.findUnique({
        where: { id: event.id }
      });
      expect(updatedEvent).toBeDefined();
      expect(updatedEvent?.name).toBe(updateData.name);
    });

    it('should not allow changing status to COMPLETED without a result', async () => {
      // Create an admin user, a sport, and an event
      const admin = await createAdmin();
      const token = generateToken(admin);
      const sport = await createSport({ name: 'Football' });
      const event = await createEvent(sport.id, { name: 'Test Event' });

      // Try to update status to COMPLETED without providing a result
      const updateData = {
        status: 'COMPLETED'
      };

      const response = await agent
        .put(`/api/events/${event.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('No se puede marcar un evento como COMPLETED sin proporcionar un resultado');

      // Check that event status was not updated in database
      const updatedEvent = await prisma.event.findUnique({
        where: { id: event.id }
      });
      expect(updatedEvent).toBeDefined();
      expect(updatedEvent?.status).not.toBe('COMPLETED');
    });

    it('should allow changing status to COMPLETED with a result', async () => {
      // Create an admin user, a sport, and an event
      const admin = await createAdmin();
      const token = generateToken(admin);
      const sport = await createSport({ name: 'Football' });
      const event = await createEvent(sport.id, { name: 'Test Event' });

      // Update status to COMPLETED with a result
      const updateData = {
        status: 'COMPLETED',
        result: 'Team A 2-1 Team B'
      };

      const response = await agent
        .put(`/api/events/${event.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.status).toBe('COMPLETED');
      // El resultado puede ser null o el valor proporcionado
      expect(response.body.data.result).toBeDefined();

      // Check that event was updated in database
      const updatedEvent = await prisma.event.findUnique({
        where: { id: event.id }
      });
      expect(updatedEvent).toBeDefined();
      expect(updatedEvent?.status).toBe('COMPLETED');
      expect(updatedEvent?.result).toBe(updateData.result);
    });

    it('should return 401 if not authenticated', async () => {
      // Create a sport and an event
      const sport = await createSport({ name: 'Football' });
      const event = await createEvent(sport.id, { name: 'Test Event' });

      const updateData = {
        name: 'Updated Event Name'
      };

      const response = await agent
        .put(`/api/events/${event.id}`)
        .send(updateData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 403 if not an admin', async () => {
      // Create a regular user, a sport, and an event
      const user = await createUser();
      const token = generateToken(user);
      const sport = await createSport({ name: 'Football' });
      const event = await createEvent(sport.id, { name: 'Test Event' });

      const updateData = {
        name: 'Updated Event Name'
      };

      const response = await agent
        .put(`/api/events/${event.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 404 if event does not exist', async () => {
      // Create an admin user
      const admin = await createAdmin();
      const token = generateToken(admin);

      const updateData = {
        name: 'Updated Event Name'
      };

      const response = await agent
        .put('/api/events/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
});
