import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UsersList from './UsersList';
// Mock del servicio de administración
jest.mock('../../../../services/admin.service', () => ({
  __esModule: true,
  default: {
    getUsers: jest.fn(),
    getUserById: jest.fn(),
    updateUser: jest.fn(),
    changeUserRole: jest.fn(),
    deactivateUser: jest.fn(),
    activateUser: jest.fn(),
  },
}));

// Importar el mock
const adminService = jest.requireMock('../../../../services/admin.service').default;

// Mock del hook useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('UsersList Component', () => {
  // Datos de prueba para usuarios
  const mockUsers = [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'ADMIN',
      balance: 1000,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      name: 'Normal User',
      email: 'user@example.com',
      role: 'USER',
      balance: 500,
      createdAt: '2023-01-02T00:00:00.000Z',
      updatedAt: '2023-01-02T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    // Resetear los mocks antes de cada prueba
    jest.clearAllMocks();
    mockNavigate.mockReset();
  });

  test('renders loading state initially', () => {
    // Configurar el mock para simular que está cargando
    (adminService.getUsers as jest.Mock).mockReturnValue(
      new Promise(() => {}) // Promise que nunca se resuelve para mantener el estado de carga
    );

    render(
      <MemoryRouter>
        <UsersList />
      </MemoryRouter>
    );

    // Verificar que se muestra el estado de carga
    expect(screen.getByText('Cargando usuarios...')).toBeInTheDocument();
  });

  test('renders users list when data is loaded', async () => {
    // Configurar el mock para simular una respuesta exitosa
    (adminService.getUsers as jest.Mock).mockResolvedValue({
      success: true,
      count: mockUsers.length,
      data: mockUsers,
    });

    render(
      <MemoryRouter>
        <UsersList />
      </MemoryRouter>
    );

    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.queryByText('Cargando usuarios...')).not.toBeInTheDocument();
    });

    // Verificar que se muestra la lista de usuarios
    expect(screen.getByText('Gestión de Usuarios')).toBeInTheDocument();
    expect(screen.getByText(`Total de usuarios: ${mockUsers.length}`)).toBeInTheDocument();

    // Verificar que se muestran los usuarios
    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    expect(screen.getByText('Normal User')).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();

    // Verificar que se muestran los roles correctamente
    const adminRoles = screen.getAllByText('Administrador');
    const userRoles = screen.getAllByText('Usuario');
    expect(adminRoles.length).toBe(1);
    expect(userRoles.length).toBe(1);
  });

  test('renders error message when loading fails', async () => {
    // Configurar el mock para simular un error
    const errorMessage = 'Error al cargar los usuarios';
    (adminService.getUsers as jest.Mock).mockRejectedValue({
      response: {
        data: {
          error: errorMessage,
        },
      },
    });

    render(
      <MemoryRouter>
        <UsersList />
      </MemoryRouter>
    );

    // Esperar a que se muestre el mensaje de error
    await waitFor(() => {
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });

    // Verificar que no se muestra el estado de carga
    expect(screen.queryByText('Cargando usuarios...')).not.toBeInTheDocument();
  });

  test('navigates to user details when clicking on Ver detalles', async () => {
    // Configurar el mock para simular una respuesta exitosa
    (adminService.getUsers as jest.Mock).mockResolvedValue({
      success: true,
      count: mockUsers.length,
      data: mockUsers,
    });

    render(
      <MemoryRouter>
        <UsersList />
      </MemoryRouter>
    );

    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.queryByText('Cargando usuarios...')).not.toBeInTheDocument();
    });

    // Hacer clic en el botón de ver detalles del primer usuario
    const viewButtons = screen.getAllByText('Ver detalles');
    viewButtons[0].click();

    // Verificar que se navega a la página de detalles del usuario
    expect(mockNavigate).toHaveBeenCalledWith('/admin/users/1');
  });
});
