import { User, PaginatedResponse } from '../types';
import { get, put } from './api';

export const getUsers = async (params?: { page?: number; limit?: number }) => {
  return get<PaginatedResponse<User>>('/users', params);
};

export const getUserById = async (id: string) => {
  return get<User>(`/users/${id}`);
};

export const updateUserRole = async (id: string, role: 'USER' | 'ADMIN') => {
  return put<User>(`/users/${id}/role`, { role });
};
