export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface Sport {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Participant {
  id: string;
  name: string;
  odds: number;
  eventId: string;
  createdAt: string;
  updatedAt: string;
}

export type Event = {
  id: string;
  name: string;
  startTime: string;
  endTime?: string;
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
  result?: string;
  sportId: string;
  sport?: Sport;
  participants: Participant[];
  createdAt: string;
  updatedAt: string;
}

export interface Bet {
  id: string;
  amount: number;
  odds: number;
  selection: string;
  status: 'PENDING' | 'WON' | 'LOST' | 'CANCELLED';
  potentialWinnings: number;
  userId: string;
  eventId: string;
  event?: Event;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
