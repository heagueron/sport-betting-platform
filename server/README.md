# Sports Betting Platform - Server

This is the backend server for the Sports Betting Platform.

## Technologies Used

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT Authentication

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   DATABASE_URL="postgresql://username:password@localhost:5432/sports_betting?schema=public"
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d
   JWT_COOKIE_EXPIRE=30
   ```

4. Run Prisma migrations to set up the database:
   ```
   npx prisma migrate dev
   ```

5. Seed the database with initial data:
   ```
   npm run seed       # Seed sports, events, and users
   npm run seed:bets  # Add sample bets (run after the main seed)
   ```

### Running the Server

Development mode:
```
npm run dev
```

Production mode:
```
npm run build
npm start
```

## Seed Data

The seed script populates the database with the following data:

- **Users**:
  - Admin user (email: admin@example.com, password: admin123)
  - 5 regular users (email: user1@example.com through user5@example.com, password: password123)

- **Sports**:
  - 10 sports (Football, Basketball, Tennis, Baseball, Hockey, Soccer, Golf, MMA, Boxing, Cricket)

- **Events**:
  - 3 events per sport (30 events total)
  - Events have different statuses (SCHEDULED, LIVE)
  - Each event has participants with random odds

- **Bets** (created by the bet seed script):
  - 3-5 random bets for each regular user
  - Various bet amounts, selections, and statuses (PENDING, WON, LOST)

For more details about the seed data, see the [Prisma README](./prisma/README.md).

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- GET /api/auth/logout - Logout user
- GET /api/auth/me - Get current user
- PUT /api/auth/updatedetails - Update user details
- PUT /api/auth/updatepassword - Update password

### Users
- GET /api/users - Get all users (admin)
- GET /api/users/:id - Get single user
- PUT /api/users/:id/balance - Update user balance

### Bets
- POST /api/bets - Create a new bet
- GET /api/bets - Get all bets (admin)
- GET /api/bets/user - Get user bets
- GET /api/bets/:id - Get single bet
- PUT /api/bets/:id/settle - Settle bet

### Sports
- POST /api/sports - Create a new sport (admin)
- GET /api/sports - Get all sports
- GET /api/sports/:id - Get single sport
- GET /api/sports/:id/events - Get sport events
- PUT /api/sports/:id - Update sport (admin)
- DELETE /api/sports/:id - Delete sport (admin)

## License

This project is licensed under the ISC License.
