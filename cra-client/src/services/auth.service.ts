import apiClient from './api';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  data: User;
}

/**
 * Register a new user
 * @param userData User registration data
 * @returns Promise with auth response
 */
export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', userData);
  return response.data;
};

/**
 * Login a user
 * @param credentials User login credentials
 * @returns Promise with auth response
 */
export const login = async (credentials: LoginData): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
  return response.data;
};

/**
 * Logout the current user
 * @returns Promise with success status
 */
export const logout = async (): Promise<{ success: boolean }> => {
  const response = await apiClient.get<{ success: boolean }>('/auth/logout');
  return response.data;
};

/**
 * Get the current user's profile
 * @returns Promise with user data
 */
export const getCurrentUser = async (): Promise<{ success: boolean; data: User }> => {
  const response = await apiClient.get<{ success: boolean; data: User }>('/auth/me');
  return response.data;
};

/**
 * Update user details
 * @param userData User data to update
 * @returns Promise with updated user data
 */
export const updateUserDetails = async (userData: Partial<User>): Promise<{ success: boolean; data: User }> => {
  const response = await apiClient.put<{ success: boolean; data: User }>('/auth/updatedetails', userData);
  return response.data;
};

/**
 * Update user password
 * @param passwordData Password data
 * @returns Promise with success status
 */
export const updatePassword = async (passwordData: { currentPassword: string; newPassword: string }): Promise<{ success: boolean }> => {
  const response = await apiClient.put<{ success: boolean }>('/auth/updatepassword', passwordData);
  return response.data;
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  updateUserDetails,
  updatePassword,
};

export default authService;
