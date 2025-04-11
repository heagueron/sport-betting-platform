import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SportsList from './SportsList';

// Mock del servicio de administración
jest.mock('../../../../services/admin.service', () => ({
  __esModule: true,
  default: {
    getSports: jest.fn(),
    createSport: jest.fn(),
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

describe('SportsList Component', () => {
  // Datos de prueba para deportes
  const mockSports = [
    {
      id: '1',
      name: 'Fútbol',
      slug: 'futbol',
      active: true,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      name: 'Baloncesto',
      slug: 'baloncesto',
      active: false,
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
    adminService.getSports.mockReturnValue(
      new Promise(() => {}) // Promise que nunca se resuelve para mantener el estado de carga
    );

    render(
      <MemoryRouter>
        <SportsList />
      </MemoryRouter>
    );

    // Verificar que se muestra el estado de carga
    expect(screen.getByText('Cargando deportes...')).toBeInTheDocument();
  });

  test('renders sports list when data is loaded', async () => {
    // Configurar el mock para simular una respuesta exitosa
    adminService.getSports.mockResolvedValue({
      success: true,
      count: mockSports.length,
      data: mockSports,
    });

    render(
      <MemoryRouter>
        <SportsList />
      </MemoryRouter>
    );

    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.queryByText('Cargando deportes...')).not.toBeInTheDocument();
    });

    // Verificar que se muestra la lista de deportes
    expect(screen.getByText('Gestión de Deportes')).toBeInTheDocument();
    expect(screen.getByText(`Total de deportes: ${mockSports.length}`)).toBeInTheDocument();

    // Verificar que se muestran los deportes
    expect(screen.getByText('Fútbol')).toBeInTheDocument();
    expect(screen.getByText('futbol')).toBeInTheDocument();
    expect(screen.getByText('Baloncesto')).toBeInTheDocument();
    expect(screen.getByText('baloncesto')).toBeInTheDocument();

    // Verificar que se muestran los estados correctamente
    const activeStates = screen.getAllByText('Activo');
    const inactiveStates = screen.getAllByText('Inactivo');
    expect(activeStates.length).toBe(1);
    expect(inactiveStates.length).toBe(1);
  });

  test('navigates to sport details when clicking on Ver detalles', async () => {
    // Configurar el mock para simular una respuesta exitosa
    adminService.getSports.mockResolvedValue({
      success: true,
      count: mockSports.length,
      data: mockSports,
    });

    render(
      <MemoryRouter>
        <SportsList />
      </MemoryRouter>
    );

    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.queryByText('Cargando deportes...')).not.toBeInTheDocument();
    });

    // Hacer clic en el botón de ver detalles del primer deporte
    const viewButtons = screen.getAllByText('Ver detalles');
    viewButtons[0].click();

    // Verificar que se navega a la página de detalles del deporte
    expect(mockNavigate).toHaveBeenCalledWith('/admin/sports/1');
  });

  test('shows create form when clicking on Crear Nuevo Deporte', async () => {
    // Configurar el mock para simular una respuesta exitosa
    adminService.getSports.mockResolvedValue({
      success: true,
      count: mockSports.length,
      data: mockSports,
    });

    render(
      <MemoryRouter>
        <SportsList />
      </MemoryRouter>
    );

    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.queryByText('Cargando deportes...')).not.toBeInTheDocument();
    });

    // Hacer clic en el botón de crear nuevo deporte
    fireEvent.click(screen.getByText('Crear Nuevo Deporte'));

    // Verificar que se muestra el formulario de creación
    expect(screen.getByText('Crear Nuevo Deporte')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre:')).toBeInTheDocument();
    expect(screen.getByText('Guardar')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
  });

  test('creates a new sport when submitting the form', async () => {
    // Configurar el mock para simular una respuesta exitosa
    adminService.getSports.mockResolvedValue({
      success: true,
      count: mockSports.length,
      data: mockSports,
    });

    adminService.createSport.mockResolvedValue({
      success: true,
      data: {
        id: '3',
        name: 'Tenis',
        slug: 'tenis',
        active: true,
        createdAt: '2023-01-03T00:00:00.000Z',
        updatedAt: '2023-01-03T00:00:00.000Z',
      },
    });

    render(
      <MemoryRouter>
        <SportsList />
      </MemoryRouter>
    );

    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.queryByText('Cargando deportes...')).not.toBeInTheDocument();
    });

    // Hacer clic en el botón de crear nuevo deporte
    fireEvent.click(screen.getByText('Crear Nuevo Deporte'));

    // Rellenar el formulario
    fireEvent.change(screen.getByLabelText('Nombre:'), { target: { value: 'Tenis' } });

    // Enviar el formulario
    fireEvent.click(screen.getByText('Guardar'));

    // Verificar que se llamó al servicio con los datos correctos
    await waitFor(() => {
      expect(adminService.createSport).toHaveBeenCalledWith({
        name: 'Tenis',
        active: true,
      });
    });

    // Verificar que se recargó la lista de deportes
    expect(adminService.getSports).toHaveBeenCalledTimes(2);
  });

  test('activates a sport when clicking on Activar', async () => {
    // Configurar el mock para simular una respuesta exitosa
    adminService.getSports.mockResolvedValue({
      success: true,
      count: mockSports.length,
      data: mockSports,
    });

    adminService.activateSport.mockResolvedValue({
      success: true,
      data: {
        ...mockSports[1],
        active: true,
      },
    });

    render(
      <MemoryRouter>
        <SportsList />
      </MemoryRouter>
    );

    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.queryByText('Cargando deportes...')).not.toBeInTheDocument();
    });

    // Hacer clic en el botón de activar del segundo deporte (que está inactivo)
    const activateButtons = screen.getAllByText('Activar');
    activateButtons[0].click();

    // Verificar que se llamó al servicio con los datos correctos
    await waitFor(() => {
      expect(adminService.activateSport).toHaveBeenCalledWith('2');
    });

    // Verificar que se muestra el mensaje de éxito
    expect(screen.getByText('Deporte activado correctamente')).toBeInTheDocument();
  });

  test('deactivates a sport when clicking on Desactivar', async () => {
    // Configurar el mock para simular una respuesta exitosa
    adminService.getSports.mockResolvedValue({
      success: true,
      count: mockSports.length,
      data: mockSports,
    });

    adminService.deactivateSport.mockResolvedValue({
      success: true,
      data: {
        ...mockSports[0],
        active: false,
      },
    });

    render(
      <MemoryRouter>
        <SportsList />
      </MemoryRouter>
    );

    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.queryByText('Cargando deportes...')).not.toBeInTheDocument();
    });

    // Hacer clic en el botón de desactivar del primer deporte (que está activo)
    const deactivateButtons = screen.getAllByText('Desactivar');
    deactivateButtons[0].click();

    // Verificar que se llamó al servicio con los datos correctos
    await waitFor(() => {
      expect(adminService.deactivateSport).toHaveBeenCalledWith('1');
    });

    // Verificar que se muestra el mensaje de éxito
    expect(screen.getByText('Deporte desactivado correctamente')).toBeInTheDocument();
  });
});
