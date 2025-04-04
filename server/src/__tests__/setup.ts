import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

// Create a new Prisma client for tests
const prisma = new PrismaClient();

// Global setup - runs before all tests
beforeAll(async () => {
  try {
    // Reset the test database before running tests
    // This ensures we have a clean state for each test run
    console.log('Setting up test database...');

    // We'll assume the test database already exists
    // It should be created manually before running tests

    // Run migrations on the test database
    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
      stdio: 'inherit',
    });

    // Connect to the database
    await prisma.$connect();

    console.log('Test database setup complete');
  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  }
});

// After each test, clean up the database
afterEach(async () => {
  // Delete all data from tables in reverse order to avoid foreign key constraints
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename NOT LIKE '_prisma%'`;

  // Skip system tables
  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => !name.startsWith('_'));

  try {
    // Since we don't have permission to set session_replication_role,
    // we'll delete records directly with cascading deletes
    for (const table of tables) {
      try {
        await prisma.$executeRawUnsafe(`DELETE FROM "${table}";`);
      } catch (err) {
        // Ignore errors, as some tables might have foreign key constraints
        // We'll delete them when we delete their parent tables
      }
    }
  } catch (error) {
    console.error('Error cleaning up test database:', error);
  }
});

// Global teardown - runs after all tests
afterAll(async () => {
  await prisma.$disconnect();
});

// Make Prisma client available globally for tests
export { prisma };
