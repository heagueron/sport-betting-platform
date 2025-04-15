import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { User, LoginData, RegisterData } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginData) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      // Limpiar cualquier sesión anterior para evitar inicios de sesión automáticos
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials: LoginData): Promise<void> => {
    console.log('AuthContext: login called with credentials:', credentials);
    setIsLoading(true);
    setError(null);

    try {
      console.log('AuthContext: calling authService.login');
      const response = await authService.login(credentials);
      console.log('AuthContext: login response received:', response);

      // Save token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.data));

      setUser(response.data);
      setIsAuthenticated(true);
      console.log('AuthContext: user authenticated successfully');
    } catch (error: any) {
      console.error('AuthContext: login error:', error);
      setError(error.response?.data?.error || 'Failed to login');
      throw error;
    } finally {
      setIsLoading(false);
      console.log('AuthContext: login process completed');
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.register(userData);

      // Save token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.data));

      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to register');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);

    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear token and user data
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  const clearError = (): void => {
    setError(null);
  };

  // Update user data
  const updateUser = async (userData: Partial<User>): Promise<void> => {
    try {
      const response = await authService.updateUserDetails(userData);
      setUser(response.data);
      // Update user in localStorage
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      console.error('Update user error:', error);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
