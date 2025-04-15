import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import SportDetail from './SportDetail';

// Mock del servicio de administración
jest.mock('../../../../services/admin.service', () => ({
  __esModule: true,
  default: {
    getSportById: jest.fn(),
    updateSport: jest.fn(),
    activateSport: jest.fn(),
    deactivateSport: jest.fn(),
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

// Mock del hook useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('SportDetail Component', () => {
  // Datos de prueba para un deporte
  const mockSport = {
    id: '1',
    name: 'Fútbol',
    slug: 'futbol',
    active: true,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    // Resetear los mocks antes de cada prueba
    jest.clearAllMocks();
    mockNavigate.mockReset();
  });

  test('renders loading state initially', () => {
    // Configurar el mock para simular que está cargando
    adminService.getSportById.mockReturnValue(
      new Promise(() => {}) // Promise que nunca se resuelve para mantener el estado de carga
    );

    render(
      <MemoryRouter initialEntries={['/admin/sports/1']}>
        <Routes>
          <Route path="/admin/sports/:sportId" element={<SportDetail />} />
        </Routes>
      </MemoryRouter>
    );

    // Verificar que se muestra el estado de carga
    expect(screen.getByText('Cargando deporte...')).toBeInTheDocument();
  });

  test('renders sport details when data is loaded', async () => {
    // Configurar el mock para simular una respuesta exitosa
    adminService.getSportById.mockResolvedValue({
      success: true,
      data: mockSport,
    });

    render(
      <MemoryRouter initialEntries={['/admin/sports/1']}>
        <Routes>
          <Route path="/admin/sports/:sportId" element={<SportDetail />} />
        </Routes>
      </MemoryRouter>
    );

    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.queryByText('Cargando deporte...')).not.toBeInTheDocument();
    });

    // Verificar que se muestran los detalles del deporte
    expect(screen.getByText('Detalles del Deporte')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Fútbol')).toBeInTheDocument();
    expect(screen.getByDisplayValue('futbol')).toBeInTheDocument();
    expect(screen.getByText('Activo')).toBeInTheDocument();
  });

  test('renders error message when loading fails', async () => {
    // Configurar el mock para simular un error
    const errorMessage = 'Error al cargar el deporte';
    adminService.getSportById.mockRejectedValue({
      response: {
        data: {
          error: errorMessage,
        },
      },
    });

    render(
      <MemoryRouter initialEntries={['/admin/sports/1']}>
        <Routes>
          <Route path="/admin/sports/:sportId" element={<SportDetail />} />
        </Routes>
      </MemoryRouter>
    );

    // Esperar a que se muestre el mensaje de error
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('updates sport name when saving changes', async () => {
    // Configurar el mock para simular una respuesta exitosa
    adminService.getSportById.mockResolvedValue({
      success: true,
      data: mockSport,
    });

    adminService.updateSport.mockResolvedValue({
      success: true,
      data: {
        ...mockSport,
        name: 'Fútbol Sala',
        updatedAt: '2023-01-02T00:00:00.000Z',
      },
    });

    render(
      <MemoryRouter initialEntries={['/admin/sports/1']}>
        <Routes>
          <Route path="/admin/sports/:sportId" element={<SportDetail />} />
        </Routes>
      </MemoryRouter>
    );

    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.queryByText('Cargando deporte...')).not.toBeInTheDocument();
    });

    // Cambiar el nombre del deporte
    const nameInput = screen.getByDisplayValue('Fútbol');
    fireEvent.change(nameInput, { target: { value: 'Fútbol Sala' } });

    // Guardar los cambios
    fireEvent.click(screen.getByText('Guardar Cambios'));

    // Verificar que se llamó al servicio con los datos correctos
    await waitFor(() => {
      expect(adminService.updateSport).toHaveBeenCalledWith('1', {
        name: 'Fútbol Sala',
      });
    });

    // Verificar que se muestra el mensaje de éxito
    await waitFor(() => {
      expect(screen.getByText('Deporte actualizado correctamente')).toBeInTheDocument();
    });
  });

  test('deactivates sport when clicking on Desactivar Deporte', async () => {
    // Configurar el mock para simular una respuesta exitosa
    adminService.getSportById.mockResolvedValue({
      success: true,
      data: mockSport,
    });

    adminService.deactivateSport.mockResolvedValue({
      success: true,
      data: {
        ...mockSport,
        active: false,
        updatedAt: '2023-01-02T00:00:00.000Z',
      },
    });

    render(
      <MemoryRouter initialEntries={['/admin/sports/1']}>
        <Routes>
          <Route path="/admin/sports/:sportId" element={<SportDetail />} />
        </Routes>
      </MemoryRouter>
    );

    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.queryByText('Cargando deporte...')).not.toBeInTheDocument();
    });

    // Desactivar el deporte
    fireEvent.click(screen.getByText('Desactivar Deporte'));

    // Verificar que se llamó al servicio con los datos correctos
    await waitFor(() => {
      expect(adminService.deactivateSport).toHaveBeenCalledWith('1');
    });

    // Verificar que se muestra el mensaje de éxito
    await waitFor(() => {
      expect(screen.getByText('Deporte desactivado correctamente')).toBeInTheDocument();
    });
  });

  test('activates sport when clicking on Activar Deporte', async () => {
    // Configurar el mock para simular una respuesta exitosa con un deporte inactivo
    adminService.getSportById.mockResolvedValue({
      success: true,
      data: {
        ...mockSport,
        active: false,
      },
    });

    adminService.activateSport.mockResolvedValue({
      success: true,
      data: {
        ...mockSport,
        active: true,
        updatedAt: '2023-01-02T00:00:00.000Z',
      },
    });

    render(
      <MemoryRouter initialEntries={['/admin/sports/1']}>
        <Routes>
          <Route path="/admin/sports/:sportId" element={<SportDetail />} />
        </Routes>
      </MemoryRouter>
    );

    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.queryByText('Cargando deporte...')).not.toBeInTheDocument();
    });

    // Activar el deporte
    fireEvent.click(screen.getByText('Activar Deporte'));

    // Verificar que se llamó al servicio con los datos correctos
    await waitFor(() => {
      expect(adminService.activateSport).toHaveBeenCalledWith('1');
    });

    // Verificar que se muestra el mensaje de éxito
    await waitFor(() => {
      expect(screen.getByText('Deporte activado correctamente')).toBeInTheDocument();
    });
  });

  test('navigates back to sports list when clicking on Volver a la lista', async () => {
    // Configurar el mock para simular una respuesta exitosa
    adminService.getSportById.mockResolvedValue({
      success: true,
      data: mockSport,
    });

    render(
      <MemoryRouter initialEntries={['/admin/sports/1']}>
        <Routes>
          <Route path="/admin/sports/:sportId" element={<SportDetail />} />
        </Routes>
      </MemoryRouter>
    );

    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.queryByText('Cargando deporte...')).not.toBeInTheDocument();
    });

    // Hacer clic en el botón de volver a la lista
    fireEvent.click(screen.getByText('Volver a la lista'));

    // Verificar que se navega a la lista de deportes
    expect(mockNavigate).toHaveBeenCalledWith('/admin/sports');
  });
});
