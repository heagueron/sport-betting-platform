import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminPage from './AdminPage';

// Mock del hook useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock del contexto de autenticación
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('AdminPage Component', () => {
  const mockUseAuth = jest.requireMock('../../../contexts/AuthContext').useAuth;

  beforeEach(() => {
    // Resetear los mocks antes de cada prueba
    mockUseAuth.mockReset();
    mockNavigate.mockReset();
  });

  test('renders admin panel when user is admin', () => {
    // Configurar el mock para simular un usuario administrador
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'ADMIN',
      },
    });

    render(
      <MemoryRouter>
        <AdminPage />
      </MemoryRouter>
    );

    // Verificar que se muestra el panel de administración
    expect(screen.getByText('Panel de Administración')).toBeInTheDocument();
    expect(screen.getByText('Bienvenido, Admin User')).toBeInTheDocument();
    
    // Verificar que se muestran las secciones del panel
    expect(screen.getByText('Usuarios')).toBeInTheDocument();
    expect(screen.getByText('Deportes')).toBeInTheDocument();
    expect(screen.getByText('Eventos')).toBeInTheDocument();
    expect(screen.getByText('Apuestas')).toBeInTheDocument();
  });

  test('shows access denied when user is not admin', () => {
    // Configurar el mock para simular un usuario normal
    mockUseAuth.mockReturnValue({
      user: {
        id: '2',
        name: 'Normal User',
        email: 'user@example.com',
        role: 'USER',
      },
    });

    render(
      <MemoryRouter>
        <AdminPage />
      </MemoryRouter>
    );

    // Verificar que se muestra el mensaje de acceso denegado
    expect(screen.getByText('Acceso Denegado')).toBeInTheDocument();
    expect(screen.getByText('No tienes permisos para acceder a esta página.')).toBeInTheDocument();
    expect(screen.getByText('Volver al Inicio')).toBeInTheDocument();
  });

  test('navigates to users management when clicking on Gestionar Usuarios', () => {
    // Configurar el mock para simular un usuario administrador
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'ADMIN',
      },
    });

    render(
      <MemoryRouter>
        <AdminPage />
      </MemoryRouter>
    );

    // Hacer clic en el botón de gestionar usuarios
    fireEvent.click(screen.getByText('Gestionar Usuarios'));

    // Verificar que se navega a la página de gestión de usuarios
    expect(mockNavigate).toHaveBeenCalledWith('/admin/users');
  });

  test('navigates to sports management when clicking on Gestionar Deportes', () => {
    // Configurar el mock para simular un usuario administrador
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'ADMIN',
      },
    });

    render(
      <MemoryRouter>
        <AdminPage />
      </MemoryRouter>
    );

    // Hacer clic en el botón de gestionar deportes
    fireEvent.click(screen.getByText('Gestionar Deportes'));

    // Verificar que se navega a la página de gestión de deportes
    expect(mockNavigate).toHaveBeenCalledWith('/admin/sports');
  });

  test('navigates to events management when clicking on Gestionar Eventos', () => {
    // Configurar el mock para simular un usuario administrador
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'ADMIN',
      },
    });

    render(
      <MemoryRouter>
        <AdminPage />
      </MemoryRouter>
    );

    // Hacer clic en el botón de gestionar eventos
    fireEvent.click(screen.getByText('Gestionar Eventos'));

    // Verificar que se navega a la página de gestión de eventos
    expect(mockNavigate).toHaveBeenCalledWith('/admin/events');
  });

  test('navigates to bets management when clicking on Gestionar Apuestas', () => {
    // Configurar el mock para simular un usuario administrador
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'ADMIN',
      },
    });

    render(
      <MemoryRouter>
        <AdminPage />
      </MemoryRouter>
    );

    // Hacer clic en el botón de gestionar apuestas
    fireEvent.click(screen.getByText('Gestionar Apuestas'));

    // Verificar que se navega a la página de gestión de apuestas
    expect(mockNavigate).toHaveBeenCalledWith('/admin/bets');
  });

  test('navigates to home when clicking on Volver al Inicio', () => {
    // Configurar el mock para simular un usuario normal
    mockUseAuth.mockReturnValue({
      user: {
        id: '2',
        name: 'Normal User',
        email: 'user@example.com',
        role: 'USER',
      },
    });

    render(
      <MemoryRouter>
        <AdminPage />
      </MemoryRouter>
    );

    // Hacer clic en el botón de volver al inicio
    fireEvent.click(screen.getByText('Volver al Inicio'));

    // Verificar que se navega a la página de inicio
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
