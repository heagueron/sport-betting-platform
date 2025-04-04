# Database Seed Scripts

This directory contains seed scripts that populate the database with initial data for development, testing, and demonstration purposes.

## What the Seed Script Creates

The seed script creates the following data:

1. **Users**:
   - 1 admin user (email: admin@example.com, password: admin123)
   - 5 regular users (email: user1@example.com through user5@example.com, password: password123)

2. **Sports**:
   - 10 sports (Football, Basketball, Tennis, Baseball, Hockey, Soccer, Golf, MMA, Boxing, Cricket)

3. **Events**:
   - 3 events per sport (30 events total)
   - Events have different statuses (SCHEDULED, LIVE)
   - Events have start times ranging from today to 7 days in the future

4. **Participants**:
   - Each event has participants with random odds
   - The number and names of participants depend on the sport type

## How to Run the Seed Scripts

### ⚠️ WARNING: DESTRUCTIVE SEED SCRIPTS ⚠️

The following scripts will **DELETE ALL EXISTING DATA** in the database before creating new data. They should **NEVER** be used in production environments!

#### Main Seed Script (DESTRUCTIVE)

```bash
# Using npm script
npm run seed

# Using Prisma CLI
npx prisma db seed
```

#### Bet Seed Script (DESTRUCTIVE)

After running the main seed script, you can populate the database with sample bets using:

```bash
npm run seed:bets
```

This will create 3-5 random bets for each regular user in the system.

### ✅ NON-DESTRUCTIVE SEED SCRIPT (SAFE FOR PRODUCTION)

The following script adds demo data without deleting existing records. It's safe to use in any environment, including production:

```bash
npm run seed:demo
```

This script:
- Checks if demo data already exists before creating it
- Adds clearly labeled demo data (prefixed with "Demo")
- Never deletes existing data
- Creates a smaller set of demo data (3 sports, 2 events per sport)

## Clearing Existing Data

The destructive seed scripts (`seed.ts` and `seedBets.ts`) automatically clear existing data from the database before creating new data. This ensures that you start with a clean slate in development and testing environments.

The non-destructive seed script (`seedDemo.ts`) does NOT clear any existing data. It checks if demo data already exists before creating it, making it safe for all environments.

## Customizing the Seed Data

If you want to customize the seed data, you can modify the `seed.ts` file. Here are some common customizations:

- Change the number of users created
- Add more sports or modify existing ones
- Change the number of events per sport
- Modify the participant names and odds
- Change the event statuses and dates

## Using Prisma Studio to View Data

You can use Prisma Studio to view and edit the data in your database:

```bash
npx prisma studio
```

This will open a web interface at http://localhost:5555 where you can browse and edit your data.
