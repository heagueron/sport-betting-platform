# Sports Betting Platform - Server

This is the backend server for the Sports Betting Platform.

## Technologies Used

- Node.js
- Express.js
- TypeScript
- MongoDB
- JWT Authentication

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB

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
   MONGO_URI=mongodb://localhost:27017/sports-betting
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d
   JWT_COOKIE_EXPIRE=30
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
