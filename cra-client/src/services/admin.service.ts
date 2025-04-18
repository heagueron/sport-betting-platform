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

// Interfaces para la gestión de deportes
export interface Sport {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SportListResponse {
  success: boolean;
  count: number;
  data: Sport[];
}

export interface SportResponse {
  success: boolean;
  data: Sport;
}

// Interfaces para la gestión de eventos
export interface Participant {
  id?: string;
  name: string;
  odds: number;
  eventId?: string;
}

export interface Event {
  id: string;
  name: string;
  sportId: string;
  sport?: Sport;
  startTime: string;
  endTime?: string;
  status: string;
  format?: 'HEAD_TO_HEAD' | 'MULTI_PARTICIPANT';
  result?: string;
  participants?: Participant[];
  createdAt: string;
  updatedAt: string;
}

export interface EventListResponse {
  success: boolean;
  count: number;
  data: Event[];
}

export interface EventResponse {
  success: boolean;
  data: Event;
}

// Interfaces para la gestión de apuestas
export interface Bet {
  id: string;
  amount: number;
  odds: number;
  selection: string;
  status: string;
  type: 'BACK' | 'LAY';
  matchedAmount: number;
  createdAt: string;
  updatedAt: string;
  settledAt?: string;
}

// Interfaces para la gestión de mercados
export interface Market {
  id: string;
  name: string;
  eventId: string;
  event?: Event;
  status: 'OPEN' | 'SUSPENDED' | 'CLOSED' | 'SETTLED' | 'CANCELLED';
  winningSelection?: string;
  createdAt: string;
  updatedAt: string;
  settledAt?: string;
  bets?: Bet[];
}

export interface MarketListResponse {
  success: boolean;
  data: Market[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface MarketResponse {
  success: boolean;
  data: Market;
}


// Servicio para la gestión desde el panel de administración
const adminService = {
  // ===== USUARIOS =====
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

  // ===== DEPORTES =====
  // Obtener todos los deportes
  getSports: async (): Promise<SportListResponse> => {
    const response = await apiClient.get<SportListResponse>('/sports');
    return response.data;
  },

  // Obtener un deporte por su ID
  getSportById: async (sportId: string): Promise<SportResponse> => {
    const response = await apiClient.get<SportResponse>(`/sports/${sportId}`);
    return response.data;
  },

  // Crear un nuevo deporte
  createSport: async (sportData: Partial<Sport>): Promise<SportResponse> => {
    const response = await apiClient.post<SportResponse>('/sports', sportData);
    return response.data;
  },

  // Actualizar un deporte
  updateSport: async (sportId: string, sportData: Partial<Sport>): Promise<SportResponse> => {
    const response = await apiClient.put<SportResponse>(`/sports/${sportId}`, sportData);
    return response.data;
  },

  // Activar un deporte
  activateSport: async (sportId: string): Promise<SportResponse> => {
    const response = await apiClient.put<SportResponse>(`/sports/${sportId}/activate`, {});
    return response.data;
  },

  // Desactivar un deporte
  deactivateSport: async (sportId: string): Promise<SportResponse> => {
    const response = await apiClient.put<SportResponse>(`/sports/${sportId}/deactivate`, {});
    return response.data;
  },

  // ===== EVENTOS =====
  // Obtener todos los eventos
  getEvents: async (params?: { sportId?: string; status?: string }): Promise<EventListResponse> => {
    const response = await apiClient.get<EventListResponse>('/events', { params });
    return response.data;
  },

  // Obtener un evento por su ID
  getEventById: async (eventId: string): Promise<EventResponse> => {
    const response = await apiClient.get<EventResponse>(`/events/${eventId}`);
    return response.data;
  },

  // Crear un nuevo evento
  createEvent: async (eventData: Partial<Event>): Promise<EventResponse> => {
    const response = await apiClient.post<EventResponse>('/events', eventData);
    return response.data;
  },

  // Actualizar un evento
  updateEvent: async (eventId: string, eventData: Partial<Event>): Promise<EventResponse> => {
    const response = await apiClient.put<EventResponse>(`/events/${eventId}`, eventData);
    return response.data;
  },

  // Completar un evento
  completeEvent: async (eventId: string): Promise<EventResponse> => {
    const response = await apiClient.put<EventResponse>(`/events/${eventId}/complete`, {});
    return response.data;
  },

  // ===== MERCADOS =====
  // Obtener todos los mercados
  getMarkets: async (params?: {
    eventId?: string;
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<MarketListResponse> => {
    const response = await apiClient.get<MarketListResponse>('/markets', { params });
    return response.data;
  },

  // Obtener un mercado por su ID
  getMarketById: async (marketId: string): Promise<MarketResponse> => {
    const response = await apiClient.get<MarketResponse>(`/markets/${marketId}`);
    return response.data;
  },

  // Crear un nuevo mercado
  createMarket: async (marketData: Partial<Market>): Promise<MarketResponse> => {
    const response = await apiClient.post<MarketResponse>('/markets', marketData);
    return response.data;
  },

  // Actualizar un mercado
  updateMarket: async (marketId: string, marketData: Partial<Market>): Promise<MarketResponse> => {
    const response = await apiClient.put<MarketResponse>(`/markets/${marketId}`, marketData);
    return response.data;
  },

  // Suspender un mercado
  suspendMarket: async (marketId: string): Promise<MarketResponse> => {
    const response = await apiClient.put<MarketResponse>(`/markets/${marketId}/suspend`, {});
    return response.data;
  },

  // Reactivar un mercado
  reopenMarket: async (marketId: string): Promise<MarketResponse> => {
    const response = await apiClient.put<MarketResponse>(`/markets/${marketId}/reopen`, {});
    return response.data;
  },

  // Cerrar un mercado
  closeMarket: async (marketId: string): Promise<MarketResponse> => {
    const response = await apiClient.put<MarketResponse>(`/markets/${marketId}/close`, {});
    return response.data;
  },

  // Cancelar un mercado
  cancelMarket: async (marketId: string): Promise<MarketResponse> => {
    const response = await apiClient.put<MarketResponse>(`/markets/${marketId}/cancel`, {});
    return response.data;
  },

  // Liquidar un mercado
  settleMarket: async (marketId: string, winningSelection: string): Promise<MarketResponse> => {
    console.log('Service: Intentando liquidar mercado con ID:', marketId);
    console.log('Service: URL completa:', `/markets/${marketId}/settle`);
    console.log('Service: Datos enviados:', { winningSelection });

    try {
      const response = await apiClient.put<MarketResponse>(`/markets/${marketId}/settle`, { winningSelection });
      console.log('Service: Respuesta recibida:', response.data);
      return response.data;
    } catch (error) {
      console.error('Service: Error al liquidar mercado:', error);
      throw error;
    }
  },
};

export default adminService;
