import apiClient from './api';
import { User } from './auth.service';

// Interfaces para la gestión de usuarios
export interface UserListResponse {
  success: boolean;
  count: number;
  data: User[];
}

export interface UserResponse {
  success: boolean;
  data: User;
}



// Servicio para la gestión de usuarios desde el panel de administración
const adminService = {
  // Obtener todos los usuarios
  getUsers: async (): Promise<UserListResponse> => {
    const response = await apiClient.get<UserListResponse>('/users');
    return response.data;
  },

  // Obtener un usuario por su ID
  getUserById: async (userId: string): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>(`/users/${userId}`);
    return response.data;
  },

  // Actualizar un usuario
  updateUser: async (userId: string, userData: Partial<User>): Promise<UserResponse> => {
    const response = await apiClient.put<UserResponse>(`/users/${userId}`, userData);
    return response.data;
  },

  // Cambiar el rol de un usuario
  changeUserRole: async (userId: string, role: string): Promise<UserResponse> => {
    const response = await apiClient.put<UserResponse>(`/users/${userId}/role`, { role });
    return response.data;
  },

  // Desactivar un usuario
  deactivateUser: async (userId: string): Promise<UserResponse> => {
    const response = await apiClient.put<UserResponse>(`/users/${userId}/deactivate`, {});
    return response.data;
  },

  // Activar un usuario
  activateUser: async (userId: string): Promise<UserResponse> => {
    const response = await apiClient.put<UserResponse>(`/users/${userId}/activate`, {});
    return response.data;
  },
};

export default adminService;
