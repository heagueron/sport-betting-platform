// Common types used across the application
import { Role, EventStatus, BetStatus } from '@prisma/client';

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

export interface BetData {
  eventId: string;
  amount: number;
  odds: number;
  selection: string;
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
  participants: ParticipantData[];
}
