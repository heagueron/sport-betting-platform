import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import UserDetail from './UserDetail';

// Mock del servicio de administración
jest.mock('../../../../services/admin.service', () => ({
  __esModule: true,
  default: {
    getUserById: jest.fn(),
    updateUser: jest.fn(),
    changeUserRole: jest.fn(),
    activateUser: jest.fn(),
    deactivateUser: jest.fn(),
  },
}));

// Importar el mock
const adminService = jest.requireMock('../../../../services/admin.service').default;

// Mock de react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('UserDetail Component', () => {
  // Datos de prueba para un usuario
  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'USER',
    balance: 500,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    // Resetear los mocks antes de cada prueba
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    // Configurar el mock para simular que está cargando
    adminService.getUserById.mockReturnValue(
      new Promise(() => {}) // Promise que nunca se resuelve para mantener el estado de carga
    );

    render(
      <MemoryRouter initialEntries={['/admin/users/1']}>
        <Routes>
          <Route path="/admin/users/:userId" element={<UserDetail />} />
        </Routes>
      </MemoryRouter>
    );

    // Verificar que se muestra el estado de carga
    expect(screen.getByText('Cargando usuario...')).toBeInTheDocument();
  });

  test('renders user details when data is loaded', async () => {
    // Configurar el mock para simular una respuesta exitosa
    adminService.getUserById.mockResolvedValue({
      success: true,
      data: mockUser,
    });

    render(
      <MemoryRouter initialEntries={['/admin/users/1']}>
        <Routes>
          <Route path="/admin/users/:userId" element={<UserDetail />} />
        </Routes>
      </MemoryRouter>
    );

    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.queryByText('Cargando usuario...')).not.toBeInTheDocument();
    });

    // Verificar que se muestran los detalles del usuario
    expect(screen.getByText('Detalles del Usuario')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('500')).toBeInTheDocument();
  });

  test('renders error message when loading fails', async () => {
    // Configurar el mock para simular un error
    const errorMessage = 'Error al cargar el usuario';
    adminService.getUserById.mockRejectedValue({
      response: {
        data: {
          error: errorMessage,
        },
      },
    });

    render(
      <MemoryRouter initialEntries={['/admin/users/1']}>
        <Routes>
          <Route path="/admin/users/:userId" element={<UserDetail />} />
        </Routes>
      </MemoryRouter>
    );

    // Esperar a que se muestre el mensaje de error
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('updates user name and email when saving changes', async () => {
    // Configurar el mock para simular una respuesta exitosa
    adminService.getUserById.mockResolvedValue({
      success: true,
      data: mockUser,
    });

    adminService.updateUser.mockResolvedValue({
      success: true,
      data: {
        ...mockUser,
        name: 'Updated Name',
        email: 'updated@example.com',
      },
    });

    render(
      <MemoryRouter initialEntries={['/admin/users/1']}>
        <Routes>
          <Route path="/admin/users/:userId" element={<UserDetail />} />
        </Routes>
      </MemoryRouter>
    );

    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.queryByText('Cargando usuario...')).not.toBeInTheDocument();
    });

    // Cambiar el nombre y el email
    const nameInput = screen.getByDisplayValue('Test User');
    const emailInput = screen.getByDisplayValue('test@example.com');

    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
    fireEvent.change(emailInput, { target: { value: 'updated@example.com' } });

    // Guardar los cambios
    fireEvent.click(screen.getByText('Guardar Cambios'));

    // Verificar que se llamó al servicio con los datos correctos
    await waitFor(() => {
      expect(adminService.updateUser).toHaveBeenCalledWith('1', {
        name: 'Updated Name',
        email: 'updated@example.com',
      });
    });

    // Verificar que se muestra el mensaje de éxito
    expect(screen.getByText('Usuario actualizado correctamente')).toBeInTheDocument();
  });

  test('changes user role when clicking on role button', async () => {
    // Configurar el mock para simular una respuesta exitosa
    adminService.getUserById.mockResolvedValue({
      success: true,
      data: mockUser,
    });

    adminService.changeUserRole.mockResolvedValue({
      success: true,
      data: {
        ...mockUser,
        role: 'ADMIN',
      },
    });

    render(
      <MemoryRouter initialEntries={['/admin/users/1']}>
        <Routes>
          <Route path="/admin/users/:userId" element={<UserDetail />} />
        </Routes>
      </MemoryRouter>
    );

    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.queryByText('Cargando usuario...')).not.toBeInTheDocument();
    });

    // Cambiar el rol
    fireEvent.click(screen.getByText('Cambiar a Administrador'));

    // Verificar que se llamó al servicio con los datos correctos
    await waitFor(() => {
      expect(adminService.changeUserRole).toHaveBeenCalledWith('1', 'ADMIN');
    });

    // Verificar que se muestra el mensaje de éxito
    expect(screen.getByText('Rol actualizado a ADMIN')).toBeInTheDocument();
  });

  test('activates user when clicking on activate button', async () => {
    // Configurar el mock para simular una respuesta exitosa
    adminService.getUserById.mockResolvedValue({
      success: true,
      data: {
        ...mockUser,
        balance: 0,
      },
    });

    adminService.activateUser.mockResolvedValue({
      success: true,
      data: {
        ...mockUser,
        balance: 100,
      },
    });

    render(
      <MemoryRouter initialEntries={['/admin/users/1']}>
        <Routes>
          <Route path="/admin/users/:userId" element={<UserDetail />} />
        </Routes>
      </MemoryRouter>
    );

    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.queryByText('Cargando usuario...')).not.toBeInTheDocument();
    });

    // Activar el usuario
    fireEvent.click(screen.getByText('Activar Usuario'));

    // Verificar que se llamó al servicio con los datos correctos
    await waitFor(() => {
      expect(adminService.activateUser).toHaveBeenCalledWith('1');
    });

    // Verificar que se muestra el mensaje de éxito
    expect(screen.getByText('Usuario activado correctamente')).toBeInTheDocument();
  });

  test('deactivates user when clicking on deactivate button', async () => {
    // Configurar el mock para simular una respuesta exitosa
    adminService.getUserById.mockResolvedValue({
      success: true,
      data: mockUser,
    });

    adminService.deactivateUser.mockResolvedValue({
      success: true,
      data: {
        ...mockUser,
        balance: 0,
      },
    });

    render(
      <MemoryRouter initialEntries={['/admin/users/1']}>
        <Routes>
          <Route path="/admin/users/:userId" element={<UserDetail />} />
        </Routes>
      </MemoryRouter>
    );

    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.queryByText('Cargando usuario...')).not.toBeInTheDocument();
    });

    // Desactivar el usuario
    fireEvent.click(screen.getByText('Desactivar Usuario'));

    // Verificar que se llamó al servicio con los datos correctos
    await waitFor(() => {
      expect(adminService.deactivateUser).toHaveBeenCalledWith('1');
    });

    // Verificar que se muestra el mensaje de éxito
    expect(screen.getByText('Usuario desactivado correctamente')).toBeInTheDocument();
  });
});
