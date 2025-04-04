import { PrismaClient, BetStatus } from '@prisma/client';
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
    console.error('\x1b[31m%s\x1b[0m', 'ERROR: Bet seed script cannot be run in production environment!');
    console.error('\x1b[31m%s\x1b[0m', 'This script would delete all existing bets.');
    console.error('\x1b[31m%s\x1b[0m', 'If you need to add demo bets to production, use a non-destructive script instead.');
    process.exit(1);
  }

  console.log('\x1b[33m%s\x1b[0m', '⚠️  WARNING: This script will DELETE ALL EXISTING BETS in the database!');
  console.log('\x1b[33m%s\x1b[0m', '⚠️  It should only be used in development or testing environments.');

  // Ask for confirmation
  await new Promise<void>((resolve) => {
    rl.question('Are you sure you want to continue? (yes/no): ', (answer) => {
      if (answer.toLowerCase() !== 'yes') {
        console.log('Bet seed operation cancelled.');
        process.exit(0);
      }
      resolve();
    });
  });

  console.log('Starting bet seed...');

  // Clear existing bets
  await prisma.bet.deleteMany({});
  console.log('Cleared existing bets.');

  // Get users (excluding admin)
  const users = await prisma.user.findMany({
    where: {
      role: 'USER',
    },
  });

  if (users.length === 0) {
    console.log('No users found. Please run the main seed script first.');
    return;
  }

  // Get events
  const events = await prisma.event.findMany({
    include: {
      participants: true,
    },
  });

  if (events.length === 0) {
    console.log('No events found. Please run the main seed script first.');
    return;
  }

  // Create bets for each user
  for (const user of users) {
    // Create 3-5 bets per user
    const numBets = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < numBets; i++) {
      // Select a random event
      const event = events[Math.floor(Math.random() * events.length)];

      if (!event.participants || event.participants.length === 0) {
        continue;
      }

      // Select a random participant
      const participant = event.participants[Math.floor(Math.random() * event.participants.length)];

      // Generate a random amount between 5 and 50
      const amount = 5 + Math.floor(Math.random() * 46);

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

      console.log(`Created bet for user ${user.name} on ${event.name}, selection: ${participant.name}, amount: $${amount}, status: ${status}`);
    }
  }

  console.log('\x1b[32m%s\x1b[0m', 'Bet seed completed successfully!');
  rl.close();
}

main()
  .catch((e) => {
    console.error('\x1b[31m%s\x1b[0m', 'Error during bet seed operation:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    if (rl.close) {
      rl.close();
    }
  });
