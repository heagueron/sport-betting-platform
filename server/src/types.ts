import { MarketStatus, BetType } from '@prisma/client';

/**
 * Data for creating a bet
 */
export interface BetData {
  eventId: string;
  marketId: string;
  amount: number;
  odds: number;
  selection: string;
  type?: any; // Add type property for BetType
}

/**
 * Data for creating a market
 */
export interface MarketData {
  name: string;
  status?: MarketStatus;
}

/**
 * Data for creating an event
 */
export interface EventData {
  name: string;
  sportId: string;
  startTime: Date;
  endTime?: Date;
  status?: any;
  format?: any;
  result?: string;
  participants: ParticipantData[];
}

/**
 * Data for creating a participant
 */
export interface ParticipantData {
  name: string;
}

/**
 * Data for creating a sport
 */
export interface SportData {
  name: string;
  active?: boolean;
}

/**
 * Data for creating an admin log entry
 */
export interface AdminLogData {
  userId: string;
  action: string;
  details?: string;
  ipAddress?: string;
}

/**
 * Data for updating a user
 */
export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: any;
  balance?: number;
  availableBalance?: number;
  reservedBalance?: number;
}

/**
 * Data for creating a transaction
 */
export interface TransactionData {
  userId: string;
  amount: number;
  type: any;
  status?: any;
  description?: string;
  notes?: string;
  betId?: string;
  marketId?: string;
}

/**
 * Dashboard statistics
 */
export interface DashboardStats {
  totalUsers: number;
  newUsersToday: number;
  totalTransactions: number;
  pendingTransactions: number;
  totalDeposits: number;
  totalWithdrawals: number;
}

/**
 * User statistics
 */
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  usersByDate: { date: string; count: number }[];
}

/**
 * Transaction statistics
 */
export interface TransactionStats {
  totalAmount: number;
  byStatus: { status: any; count: number }[];
  byType: { type: any; count: number }[];
  recentTransactions: any[];
}

/**
 * User registration data
 */
export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

/**
 * User login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Order book entry
 */
export interface OrderBookEntry {
  odds: number;
  amount: number;
}

/**
 * Order book for a selection
 */
export interface SelectionOrderBook {
  backBets: OrderBookEntry[];
  layBets: OrderBookEntry[];
}

/**
 * Order book for a market
 */
export interface OrderBook {
  selections: Record<string, SelectionOrderBook>;
}

/**
 * User balance information
 */
export interface UserBalance {
  balance: number;
  availableBalance: number;
  reservedBalance: number;
}
