# Database Seed Script

This directory contains a seed script that populates the database with initial data for development and testing purposes.

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

### Main Seed Script

You can run the main seed script using one of the following commands:

```bash
# Using npm script
npm run seed

# Using Prisma CLI
npx prisma db seed
```

### Bet Seed Script

After running the main seed script, you can populate the database with sample bets using:

```bash
npm run seed:bets
```

This will create 3-5 random bets for each regular user in the system.

## Clearing Existing Data

The seed script automatically clears all existing data from the database before creating new data. This ensures that you always start with a clean slate.

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
