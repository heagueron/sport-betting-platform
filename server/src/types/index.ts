// Common types used across the application
import { Role, EventStatus, EventFormat, BetStatus, BetType, MarketStatus, TransactionType, TransactionStatus } from '@prisma/client';

export interface ErrorResponse {
  success: boolean;
  error: string;
}

export interface SuccessResponse {
  success: boolean;
  data: any;
}

export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse extends SuccessResponse {
  pagination: PaginationResult;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
}

export interface BetData {
  eventId: string;
  marketId: string;
  amount: number;
  odds: number;
  selection: string;
  type?: BetType;
}

export interface MarketData {
  name: string;
  status?: MarketStatus;
}

export interface SportData {
  name: string;
  active?: boolean;
}

export interface ParticipantData {
  name: string;
  odds: number;
}

export interface EventData {
  sportId: string;
  name: string;
  startTime: Date;
  endTime?: Date;
  status?: EventStatus;
  format?: EventFormat;
  participants: ParticipantData[];
}

export interface TransactionData {
  userId: string;
  amount: number;
  type: TransactionType;
  status?: TransactionStatus;
  description?: string;
  notes?: string;
}

export interface AdminLogData {
  userId: string;
  action: string;
  details?: string;
  ipAddress?: string;
}

export interface DashboardStats {
  totalUsers: number;
  newUsersToday: number;
  totalTransactions: number;
  pendingTransactions: number;
  totalDeposits: number;
  totalWithdrawals: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  usersByDate: { date: string; count: number }[];
}

export interface TransactionStats {
  totalAmount: number;
  byStatus: { status: TransactionStatus; count: number }[];
  byType: { type: TransactionType; count: number }[];
  recentTransactions: any[];
}
