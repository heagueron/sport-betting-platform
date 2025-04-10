import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AdminRoute from './AdminRoute';
import { AuthProvider } from '../../../contexts/AuthContext';

// Mock del contexto de autenticación
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('AdminRoute Component', () => {
  const mockUseAuth = jest.requireMock('../../../contexts/AuthContext').useAuth;

  beforeEach(() => {
    // Resetear el mock antes de cada prueba
    mockUseAuth.mockReset();
  });

  test('renders children when user is admin', () => {
    // Configurar el mock para simular un usuario administrador autenticado
    mockUseAuth.mockReturnValue({
      user: { role: 'ADMIN' },
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <div data-testid="admin-content">Admin Content</div>
              </AdminRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    // Verificar que el contenido protegido se muestra
    expect(screen.getByTestId('admin-content')).toBeInTheDocument();
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  test('redirects to home when user is not admin', () => {
    // Configurar el mock para simular un usuario normal autenticado
    mockUseAuth.mockReturnValue({
      user: { role: 'USER' },
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/" element={<div data-testid="home-page">Home Page</div>} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <div data-testid="admin-content">Admin Content</div>
              </AdminRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    // Verificar que se redirige a la página de inicio
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
  });

  test('redirects to home when user is not authenticated', () => {
    // Configurar el mock para simular un usuario no autenticado
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/" element={<div data-testid="home-page">Home Page</div>} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <div data-testid="admin-content">Admin Content</div>
              </AdminRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    // Verificar que se redirige a la página de inicio
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
  });

  test('shows loading state when authentication is loading', () => {
    // Configurar el mock para simular que la autenticación está cargando
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <div data-testid="admin-content">Admin Content</div>
              </AdminRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    // Verificar que se muestra el estado de carga
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
  });
});
