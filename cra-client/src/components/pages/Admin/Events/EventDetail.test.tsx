import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EventDetail from './EventDetail';
import adminService from '../../../../services/admin.service';

// Mock the services
jest.mock('../../../../services/admin.service', () => ({
  getEventById: jest.fn(),
  getSports: jest.fn(),
  updateEvent: jest.fn()
}));

// Get the mocked functions
const mockGetEventById = adminService.getEventById as jest.Mock;
const mockGetSports = adminService.getSports as jest.Mock;
const mockUpdateEvent = adminService.updateEvent as jest.Mock;

// Set up default mock implementations
beforeEach(() => {
  mockGetEventById.mockResolvedValue({
    success: true,
    data: {
      id: '1',
      name: 'Test Event',
      sportId: '1',
      startTime: '2023-01-01T12:00:00Z',
      status: 'SCHEDULED',
      format: 'HEAD_TO_HEAD',
      createdAt: '2023-01-01T10:00:00Z',
      updatedAt: '2023-01-01T10:00:00Z',
      participants: [
        { name: 'Team A', odds: 1.5 },
        { name: 'Team B', odds: 2.5 }
      ]
    }
  });

  mockGetSports.mockResolvedValue({
    success: true,
    data: [
      { id: '1', name: 'Football' },
      { id: '2', name: 'Basketball' }
    ]
  });

  mockUpdateEvent.mockResolvedValue({
    success: true,
    data: {
      id: '1',
      name: 'Updated Event',
      sportId: '1',
      startTime: '2023-01-01T12:00:00Z',
      status: 'SCHEDULED',
      format: 'HEAD_TO_HEAD',
      createdAt: '2023-01-01T10:00:00Z',
      updatedAt: '2023-01-01T10:00:00Z'
    }
  });
});

// Mock the react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ eventId: '1' }),
  useNavigate: () => jest.fn()
}));

// Mock the translation hook
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}));

describe('EventDetail Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    render(
      <BrowserRouter>
        <EventDetail />
      </BrowserRouter>
    );

    expect(screen.getByText(/Cargando evento/i)).toBeInTheDocument();
  });

  test('renders event details after loading', async () => {
    // Spy on console.error to see what's happening
    jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <BrowserRouter>
        <EventDetail />
      </BrowserRouter>
    );

    // Wait for the loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText(/Cargando evento/i)).not.toBeInTheDocument();
    });

    // Debug the component
    console.log('Component HTML:', document.body.innerHTML);

    // Check that the event details are displayed
    expect(screen.getByText('Detalles del Evento')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Event')).toBeInTheDocument();
    expect(screen.getByText('Football')).toBeInTheDocument();

    // Restore console.error
    (console.error as jest.Mock).mockRestore();
  });

  test('shows participants when clicking on Ver participantes button', async () => {
    render(
      <BrowserRouter>
        <EventDetail />
      </BrowserRouter>
    );

    // Wait for the loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText(/Cargando evento/i)).not.toBeInTheDocument();
    });

    // Click on the Ver participantes button
    fireEvent.click(screen.getByText('Ver participantes'));

    // Check that the participants are displayed
    expect(screen.getByText('Team A')).toBeInTheDocument();
    expect(screen.getByText('Team B')).toBeInTheDocument();
    expect(screen.getByText('Cuota: 1.5')).toBeInTheDocument();
    expect(screen.getByText('Cuota: 2.5')).toBeInTheDocument();
  });

  test('updates event details when saving changes', async () => {
    render(
      <BrowserRouter>
        <EventDetail />
      </BrowserRouter>
    );

    // Wait for the loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText(/Cargando evento/i)).not.toBeInTheDocument();
    });

    // Change the event name
    fireEvent.change(screen.getByDisplayValue('Test Event'), { target: { value: 'Updated Event' } });

    // Click on the Guardar Cambios button
    fireEvent.click(screen.getByText('Guardar Cambios'));

    // Check that the updateEvent function was called with the correct data
    await waitFor(() => {
      expect(adminService.updateEvent).toHaveBeenCalledWith('1', expect.objectContaining({
        name: 'Updated Event'
      }));
    });

    // Check that the success message is displayed
    await waitFor(() => {
      expect(screen.getByText('Evento actualizado correctamente')).toBeInTheDocument();
    });
  });

  test('prevents changing status to COMPLETED without a result', async () => {
    // Mock the updateEvent function to return an error for this test
    mockUpdateEvent.mockRejectedValueOnce({
      response: {
        data: {
          error: 'No se puede marcar un evento como COMPLETED sin proporcionar un resultado',
          success: false
        }
      }
    });

    render(
      <BrowserRouter>
        <EventDetail />
      </BrowserRouter>
    );

    // Wait for the loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText(/Cargando evento/i)).not.toBeInTheDocument();
    });

    // Click on the Marcar como Completado button
    fireEvent.click(screen.getByText('Marcar como Completado'));

    // Check that the error message is displayed
    await waitFor(() => {
      expect(screen.getByText('No se puede marcar un evento como COMPLETED sin proporcionar un resultado')).toBeInTheDocument();
    });
  });

  test('allows changing status to COMPLETED with a result', async () => {
    // Mock the updateEvent function to return success for this test
    mockUpdateEvent.mockResolvedValueOnce({
      success: true,
      data: {
        id: '1',
        name: 'Test Event',
        sportId: '1',
        startTime: '2023-01-01T12:00:00Z',
        status: 'COMPLETED',
        result: 'Team A 2-1 Team B',
        format: 'HEAD_TO_HEAD',
        createdAt: '2023-01-01T10:00:00Z',
        updatedAt: '2023-01-01T10:00:00Z'
      }
    });

    render(
      <BrowserRouter>
        <EventDetail />
      </BrowserRouter>
    );

    // Wait for the loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText(/Cargando evento/i)).not.toBeInTheDocument();
    });

    // Enter a result
    fireEvent.change(screen.getByPlaceholderText('Ej: 2-1, Equipo A ganador, etc.'), { target: { value: 'Team A 2-1 Team B' } });

    // Click on the Marcar como Completado button
    fireEvent.click(screen.getByText('Marcar como Completado'));

    // Check that the updateEvent function was called with the correct data
    await waitFor(() => {
      expect(mockUpdateEvent).toHaveBeenCalledWith('1', expect.objectContaining({
        status: 'COMPLETED',
        result: 'Team A 2-1 Team B'
      }));
    });

    // Check that the success message is displayed
    await waitFor(() => {
      expect(screen.getByText('Estado actualizado a Completado')).toBeInTheDocument();
    });
  });
});
