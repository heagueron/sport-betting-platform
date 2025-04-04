import { Bet, PaginatedResponse } from '../types';
import { get, post, put } from './api';

export interface CreateBetData {
  eventId: string;
  amount: number;
  selection: string;
}

export interface UpdateBalanceData {
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAWAL';
}

export const getUserBets = async (params?: { page?: number; limit?: number }) => {
  return get<PaginatedResponse<Bet>>('/bets/user', params);
};

export const getBetById = async (id: string) => {
  return get<Bet>(`/bets/${id}`);
};

export const createBet = async (data: CreateBetData) => {
  return post<Bet>('/bets', data);
};

export const getUserBalance = async () => {
  return get<{ balance: number }>('/bets/balance');
};

export const updateUserBalance = async (data: UpdateBalanceData) => {
  return put<{ balance: number }>('/bets/balance', data);
};
