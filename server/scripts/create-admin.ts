import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating admin user...');

  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: {
      email: 'admin@aganar.com'
    }
  });

  if (existingAdmin) {
    console.log('Admin user already exists, skipping creation.');
    return;
  }

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
}

main()
  .catch((e) => {
    console.error('Error during admin user creation:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
