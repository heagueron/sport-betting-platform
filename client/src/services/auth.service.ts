import { User } from '../types';
import { post, get } from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const login = async (credentials: LoginCredentials) => {
  return post<AuthResponse>('/auth/login', credentials);
};

export const register = async (data: RegisterData) => {
  return post<AuthResponse>('/auth/register', data);
};

export const logout = async () => {
  return get('/auth/logout');
};

export const getCurrentUser = async () => {
  return get<User>('/auth/me');
};
