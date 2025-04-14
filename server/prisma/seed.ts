import { PrismaClient, Role, EventStatus, Sport, User, Event } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as readline from 'readline';

const prisma = new PrismaClient();

// Check if we're in production environment
const isProduction = process.env.NODE_ENV === 'production';

// Create readline interface for user confirmation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  // Safety check for production environment
  if (isProduction) {
    console.error('\x1b[31m%s\x1b[0m', 'ERROR: Seed script cannot be run in production environment!');
    console.error('\x1b[31m%s\x1b[0m', 'This script would delete all existing data.');
    console.error('\x1b[31m%s\x1b[0m', 'If you need to add demo data to production, use a non-destructive script instead.');
    process.exit(1);
  }

  console.log('\x1b[33m%s\x1b[0m', '⚠️  WARNING: This script will DELETE ALL EXISTING DATA in the database!');
  console.log('\x1b[33m%s\x1b[0m', '⚠️  It should only be used in development or testing environments.');

  // Ask for confirmation
  await new Promise<void>((resolve) => {
    rl.question('Are you sure you want to continue? (yes/no): ', (answer) => {
      if (answer.toLowerCase() !== 'yes') {
        console.log('Seed operation cancelled.');
        process.exit(0);
      }
      resolve();
    });
  });

  console.log('Starting seed...');

  // Clear existing data
  await clearDatabase();

  // Create users
  const adminUser = await createAdminUser();
  const regularUsers = await createRegularUsers();

  // Create sports
  const sports = await createSports();

  // Create events for each sport
  await createEvents(sports);

  console.log('\x1b[32m%s\x1b[0m', 'Seed completed successfully!');
  rl.close();
}

async function clearDatabase() {
  console.log('Clearing existing data...');

  // Delete in reverse order to avoid foreign key constraints
  await prisma.bet.deleteMany({});
  await prisma.participant.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.sport.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Database cleared.');
}

async function createAdminUser(): Promise<User> {
  console.log('Creating admin user...');

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@aganar.com',
      password: hashedPassword,
      role: Role.ADMIN,
      balance: 1000,
    },
  });

  console.log(`Admin user created with ID: ${admin.id}`);
  return admin;
}

async function createRegularUsers(): Promise<User[]> {
  console.log('Creating regular users...');

  const users = [];

  for (let i = 1; i <= 5; i++) {
    const hashedPassword = await bcrypt.hash('password123', 10);

    const user = await prisma.user.create({
      data: {
        name: `User ${i}`,
        email: `user${i}@example.com`,
        password: hashedPassword,
        role: Role.USER,
        balance: 100 * i,
      },
    });

    users.push(user);
    console.log(`Regular user created with ID: ${user.id}`);
  }

  return users;
}

async function createSports(): Promise<Sport[]> {
  console.log('Creating sports...');

  const sportsData = [
    { name: 'Football', slug: 'football' },
    { name: 'Basketball', slug: 'basketball' },
    { name: 'Tennis', slug: 'tennis' },
    { name: 'Baseball', slug: 'baseball' },
    { name: 'Hockey', slug: 'hockey' },
    { name: 'Soccer', slug: 'soccer' },
    { name: 'Golf', slug: 'golf' },
    { name: 'MMA', slug: 'mma' },
    { name: 'Boxing', slug: 'boxing' },
    { name: 'Cricket', slug: 'cricket' },
  ];

  const sports = [];

  for (const sportData of sportsData) {
    const sport = await prisma.sport.create({
      data: sportData,
    });

    sports.push(sport);
    console.log(`Sport created: ${sport.name}`);
  }

  return sports;
}

async function createEvents(sports: Sport[]): Promise<void> {
  console.log('Creating events...');

  // Current date for reference
  const now = new Date();

  // Create events for each sport
  for (const sport of sports) {
    // Create 3 events per sport
    for (let i = 1; i <= 3; i++) {
      // Set start time between now and 7 days from now
      const startTime = new Date(now);
      startTime.setDate(startTime.getDate() + Math.floor(Math.random() * 7));

      // Some events will be live
      const status = i === 1 ? EventStatus.SCHEDULED :
                    i === 2 ? EventStatus.LIVE :
                    EventStatus.SCHEDULED;

      const event = await prisma.event.create({
        data: {
          name: `${sport.name} Event ${i}`,
          startTime,
          status,
          sportId: sport.id,
        },
      });

      console.log(`Event created: ${event.name}`);

      // Create participants for the event
      await createParticipants(event);
    }
  }
}

async function createParticipants(event: Event): Promise<void> {
  // Different participant names based on the sport
  const participantsByEventName: Record<string, string[]> = {
    'Football': ['Team A', 'Team B'],
    'Basketball': ['Team A', 'Team B'],
    'Tennis': ['Player A', 'Player B'],
    'Baseball': ['Team A', 'Team B'],
    'Hockey': ['Team A', 'Team B'],
    'Soccer': ['Team A', 'Team B'],
    'Golf': ['Player A', 'Player B', 'Player C', 'Player D'],
    'MMA': ['Fighter A', 'Fighter B'],
    'Boxing': ['Boxer A', 'Boxer B'],
    'Cricket': ['Team A', 'Team B'],
  };

  // Extract the sport name from the event name
  const sportName = event.name.split(' ')[0];

  // Get the appropriate participant names
  const participantNames = participantsByEventName[sportName] || ['Team A', 'Team B'];

  // Create participants
  for (const name of participantNames) {
    // Generate random odds between 1.1 and 5.0
    const odds = parseFloat((1.1 + Math.random() * 3.9).toFixed(2));

    const participant = await prisma.participant.create({
      data: {
        name,
        odds,
        eventId: event.id,
      },
    });

    console.log(`Participant created: ${participant.name} with odds ${participant.odds}`);
  }
}

main()
  .catch((e) => {
    console.error('\x1b[31m%s\x1b[0m', 'Error during seed operation:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    if (rl.close) {
      rl.close();
    }
  });
