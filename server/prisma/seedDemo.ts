import { PrismaClient, Role, EventStatus, BetStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * This is a NON-DESTRUCTIVE seed script that can be safely run in any environment,
 * including production. It adds demo data without deleting existing records.
 */
async function main() {
  console.log('Starting non-destructive demo seed...');

  // Create demo admin user (only if it doesn't exist)
  const demoAdmin = await createDemoAdminUser();
  
  // Create demo regular users (only if they don't exist)
  const demoUsers = await createDemoRegularUsers();
  
  // Create demo sports (only if they don't exist)
  const demoSports = await createDemoSports();
  
  // Create demo events for each sport
  await createDemoEvents(demoSports);
  
  // Create demo bets
  if (demoUsers.length > 0) {
    await createDemoBets(demoUsers);
  }

  console.log('Non-destructive demo seed completed successfully!');
}

async function createDemoAdminUser() {
  console.log('Checking for demo admin user...');
  
  // Check if demo admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: {
      email: 'demo.admin@example.com',
    },
  });
  
  if (existingAdmin) {
    console.log('Demo admin user already exists, skipping creation.');
    return existingAdmin;
  }
  
  // Create demo admin user
  const hashedPassword = await bcrypt.hash('demo123', 10);
  
  const admin = await prisma.user.create({
    data: {
      name: 'Demo Admin',
      email: 'demo.admin@example.com',
      password: hashedPassword,
      role: Role.ADMIN,
      balance: 1000,
    },
  });
  
  console.log(`Demo admin user created with ID: ${admin.id}`);
  return admin;
}

async function createDemoRegularUsers() {
  console.log('Checking for demo regular users...');
  
  const demoUsers = [];
  
  for (let i = 1; i <= 3; i++) {
    // Check if demo user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: `demo.user${i}@example.com`,
      },
    });
    
    if (existingUser) {
      console.log(`Demo user ${i} already exists, skipping creation.`);
      demoUsers.push(existingUser);
      continue;
    }
    
    // Create demo user
    const hashedPassword = await bcrypt.hash('demo123', 10);
    
    const user = await prisma.user.create({
      data: {
        name: `Demo User ${i}`,
        email: `demo.user${i}@example.com`,
        password: hashedPassword,
        role: Role.USER,
        balance: 100 * i,
      },
    });
    
    demoUsers.push(user);
    console.log(`Demo regular user created with ID: ${user.id}`);
  }
  
  return demoUsers;
}

async function createDemoSports() {
  console.log('Checking for demo sports...');
  
  const demoSportsData = [
    { name: 'Demo Football', slug: 'demo-football' },
    { name: 'Demo Basketball', slug: 'demo-basketball' },
    { name: 'Demo Tennis', slug: 'demo-tennis' },
  ];
  
  const demoSports = [];
  
  for (const sportData of demoSportsData) {
    // Check if demo sport already exists
    const existingSport = await prisma.sport.findUnique({
      where: {
        slug: sportData.slug,
      },
    });
    
    if (existingSport) {
      console.log(`Demo sport ${sportData.name} already exists, skipping creation.`);
      demoSports.push(existingSport);
      continue;
    }
    
    // Create demo sport
    const sport = await prisma.sport.create({
      data: sportData,
    });
    
    demoSports.push(sport);
    console.log(`Demo sport created: ${sport.name}`);
  }
  
  return demoSports;
}

async function createDemoEvents(demoSports: any[]) {
  console.log('Creating demo events...');
  
  // Current date for reference
  const now = new Date();
  
  // Create events for each sport
  for (const sport of demoSports) {
    // Check if demo events already exist for this sport
    const existingEvents = await prisma.event.findMany({
      where: {
        sportId: sport.id,
        name: {
          startsWith: 'Demo',
        },
      },
    });
    
    if (existingEvents.length >= 2) {
      console.log(`Demo events for ${sport.name} already exist, skipping creation.`);
      continue;
    }
    
    // Create 2 events per sport
    for (let i = 1; i <= 2; i++) {
      // Set start time between now and 7 days from now
      const startTime = new Date(now);
      startTime.setDate(startTime.getDate() + Math.floor(Math.random() * 7));
      
      const status = i === 1 ? EventStatus.SCHEDULED : EventStatus.LIVE;
      
      const eventName = `Demo ${sport.name} Event ${i}`;
      
      // Check if this specific event already exists
      const existingEvent = await prisma.event.findFirst({
        where: {
          name: eventName,
          sportId: sport.id,
        },
      });
      
      if (existingEvent) {
        console.log(`Demo event ${eventName} already exists, skipping creation.`);
        continue;
      }
      
      const event = await prisma.event.create({
        data: {
          name: eventName,
          startTime,
          status,
          sportId: sport.id,
        },
      });
      
      console.log(`Demo event created: ${event.name}`);
      
      // Create participants for the event
      await createDemoParticipants(event, sport.name);
    }
  }
}

async function createDemoParticipants(event: any, sportName: string) {
  // Different participant names based on the sport
  const participantsByEventName: Record<string, string[]> = {
    'Demo Football': ['Demo Team A', 'Demo Team B'],
    'Demo Basketball': ['Demo Team A', 'Demo Team B'],
    'Demo Tennis': ['Demo Player A', 'Demo Player B'],
  };
  
  // Get the appropriate participant names
  const participantNames = participantsByEventName[sportName] || ['Demo Team A', 'Demo Team B'];
  
  // Create participants
  for (const name of participantNames) {
    // Check if participant already exists
    const existingParticipant = await prisma.participant.findFirst({
      where: {
        name,
        eventId: event.id,
      },
    });
    
    if (existingParticipant) {
      console.log(`Demo participant ${name} already exists for event ${event.name}, skipping creation.`);
      continue;
    }
    
    // Generate random odds between 1.1 and 5.0
    const odds = parseFloat((1.1 + Math.random() * 3.9).toFixed(2));
    
    const participant = await prisma.participant.create({
      data: {
        name,
        odds,
        eventId: event.id,
      },
    });
    
    console.log(`Demo participant created: ${participant.name} with odds ${participant.odds}`);
  }
}

async function createDemoBets(demoUsers: any[]) {
  console.log('Creating demo bets...');
  
  // Get events with participants
  const events = await prisma.event.findMany({
    where: {
      name: {
        startsWith: 'Demo',
      },
    },
    include: {
      participants: true,
    },
  });
  
  if (events.length === 0) {
    console.log('No demo events found, skipping bet creation.');
    return;
  }
  
  // Create bets for each user
  for (const user of demoUsers) {
    // Check if user already has demo bets
    const existingBets = await prisma.bet.count({
      where: {
        userId: user.id,
        event: {
          name: {
            startsWith: 'Demo',
          },
        },
      },
    });
    
    if (existingBets >= 2) {
      console.log(`User ${user.name} already has demo bets, skipping creation.`);
      continue;
    }
    
    // Create 2 bets per user
    for (let i = 0; i < 2; i++) {
      // Select a random event
      const event = events[Math.floor(Math.random() * events.length)];
      
      if (!event.participants || event.participants.length === 0) {
        continue;
      }
      
      // Select a random participant
      const participant = event.participants[Math.floor(Math.random() * event.participants.length)];
      
      // Generate a random amount between 5 and 20
      const amount = 5 + Math.floor(Math.random() * 16);
      
      // Calculate potential winnings
      const potentialWinnings = parseFloat((amount * participant.odds).toFixed(2));
      
      // Determine bet status (80% pending, 10% won, 10% lost)
      const statusRandom = Math.random();
      let status: BetStatus = BetStatus.PENDING;
      
      if (statusRandom > 0.9) {
        status = BetStatus.LOST;
      } else if (statusRandom > 0.8) {
        status = BetStatus.WON;
      }
      
      // Create the bet
      const bet = await prisma.bet.create({
        data: {
          userId: user.id,
          eventId: event.id,
          amount,
          odds: participant.odds,
          selection: participant.name,
          potentialWinnings,
          status,
        },
      });
      
      console.log(`Created demo bet for user ${user.name} on ${event.name}, selection: ${participant.name}, amount: $${amount}, status: ${status}`);
    }
  }
}

main()
  .catch((e) => {
    console.error('Error during demo seed operation:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
