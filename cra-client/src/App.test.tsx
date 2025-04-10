import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock del contexto de autenticación
jest.mock('./contexts/AuthContext', () => ({
  useAuth: jest.fn().mockReturnValue({
    isAuthenticated: false,
    isLoading: false,
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
    updateUser: jest.fn(),
    error: null,
    clearError: jest.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

test('renders the app with header', () => {
  render(<App />);
  // Verificar que se muestra el encabezado
  const headerElement = screen.getByRole('banner');
  expect(headerElement).toBeInTheDocument();
});
