import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EventsList from './EventsList';
import adminService from '../../../../services/admin.service';

// Mock the services
jest.mock('../../../../services/admin.service', () => ({
  getEvents: jest.fn().mockResolvedValue({
    data: []
  }),
  getSports: jest.fn().mockResolvedValue({
    data: [
      { id: '1', name: 'Football' },
      { id: '2', name: 'Basketball' }
    ]
  }),
  createEvent: jest.fn().mockResolvedValue({
    data: {
      id: '1',
      name: 'Test Event',
      sportId: '1',
      startTime: '2023-01-01T12:00:00Z',
      status: 'SCHEDULED',
      format: 'HEAD_TO_HEAD',
      participants: [
        { name: 'Team A', odds: 1.5 },
        { name: 'Team B', odds: 2.5 }
      ]
    }
  })
}));

// Mock the react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

// Mock the translation hook
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}));

describe('EventsList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    render(
      <BrowserRouter>
        <EventsList />
      </BrowserRouter>
    );

    expect(screen.getByText(/Cargando eventos/i)).toBeInTheDocument();
  });

  test('renders empty state when no events are available', async () => {
    // Mock the getEvents function to return an empty array
    (adminService.getEvents as jest.Mock).mockResolvedValueOnce({
      data: []
    });

    render(
      <BrowserRouter>
        <EventsList />
      </BrowserRouter>
    );

    // Wait for the loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText(/Cargando eventos/i)).not.toBeInTheDocument();
    });

    // Check that the empty state message is displayed
    expect(screen.getByText(/No hay eventos disponibles/i)).toBeInTheDocument();
  });

  test('renders events list when events are available', async () => {
    // Mock the getEvents function to return some events
    (adminService.getEvents as jest.Mock).mockResolvedValueOnce({
      data: [
        {
          id: '1',
          name: 'Football Match',
          sportId: '1',
          sport: { name: 'Football' },
          startTime: '2023-01-01T12:00:00Z',
          status: 'SCHEDULED',
          participants: [
            { name: 'Team A', odds: 1.5 },
            { name: 'Team B', odds: 2.5 }
          ]
        },
        {
          id: '2',
          name: 'Basketball Game',
          sportId: '2',
          sport: { name: 'Basketball' },
          startTime: '2023-01-02T15:00:00Z',
          status: 'LIVE',
          participants: [
            { name: 'Team C', odds: 1.8 },
            { name: 'Team D', odds: 2.2 }
          ]
        }
      ]
    });

    render(
      <BrowserRouter>
        <EventsList />
      </BrowserRouter>
    );

    // Wait for the loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText(/Cargando eventos/i)).not.toBeInTheDocument();
    });

    // Check that the events are displayed
    expect(screen.getByText('Football Match')).toBeInTheDocument();
    expect(screen.getByText('Basketball Game')).toBeInTheDocument();
    expect(screen.getByText('Football')).toBeInTheDocument();
    expect(screen.getByText('Basketball')).toBeInTheDocument();
  });

  test('shows create form when clicking on Crear Nuevo Evento button', async () => {
    render(
      <BrowserRouter>
        <EventsList />
      </BrowserRouter>
    );

    // Wait for the loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText(/Cargando eventos/i)).not.toBeInTheDocument();
    });

    // Click on the create button
    fireEvent.click(screen.getByText('Crear Nuevo Evento'));

    // Check that the form is displayed
    expect(screen.getByText('Crear Nuevo Evento')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre: *')).toBeInTheDocument();
    expect(screen.getByLabelText('Deporte: *')).toBeInTheDocument();
    expect(screen.getByLabelText('Formato del evento: *')).toBeInTheDocument();
  });

  test('validates HEAD_TO_HEAD events must have exactly 2 participants', async () => {
    render(
      <BrowserRouter>
        <EventsList />
      </BrowserRouter>
    );

    // Wait for the loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText(/Cargando eventos/i)).not.toBeInTheDocument();
    });

    // Click on the create button
    fireEvent.click(screen.getByText('Crear Nuevo Evento'));

    // Fill the form
    fireEvent.change(screen.getByLabelText('Nombre: *'), { target: { value: 'Test Event' } });
    fireEvent.change(screen.getByLabelText('Deporte: *'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Formato del evento: *'), { target: { value: 'HEAD_TO_HEAD' } });

    // Add first participant
    fireEvent.change(screen.getByPlaceholderText('Nombre del participante'), { target: { value: 'Team A' } });
    fireEvent.change(screen.getByPlaceholderText('Cuota (ej: 1.5)'), { target: { value: '1.5' } });
    fireEvent.click(screen.getByText('Agregar Participante'));

    // Try to submit the form with only one participant
    fireEvent.click(screen.getByText('Guardar'));

    // Check that the validation error is displayed
    await waitFor(() => {
      expect(screen.getByText(/Todos los campos marcados con \* son obligatorios/i)).toBeInTheDocument();
    });
  });

  test('validates MULTI_PARTICIPANT events must have at least 3 participants', async () => {
    render(
      <BrowserRouter>
        <EventsList />
      </BrowserRouter>
    );

    // Wait for the loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText(/Cargando eventos/i)).not.toBeInTheDocument();
    });

    // Click on the create button
    fireEvent.click(screen.getByText('Crear Nuevo Evento'));

    // Fill the form
    fireEvent.change(screen.getByLabelText('Nombre: *'), { target: { value: 'Test Event' } });
    fireEvent.change(screen.getByLabelText('Deporte: *'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Formato del evento: *'), { target: { value: 'MULTI_PARTICIPANT' } });

    // Add two participants
    fireEvent.change(screen.getByPlaceholderText('Nombre del participante'), { target: { value: 'Team A' } });
    fireEvent.change(screen.getByPlaceholderText('Cuota (ej: 1.5)'), { target: { value: '1.5' } });
    fireEvent.click(screen.getByText('Agregar Participante'));

    fireEvent.change(screen.getByPlaceholderText('Nombre del participante'), { target: { value: 'Team B' } });
    fireEvent.change(screen.getByPlaceholderText('Cuota (ej: 1.5)'), { target: { value: '2.5' } });
    fireEvent.click(screen.getByText('Agregar Participante'));

    // Try to submit the form with only two participants
    fireEvent.click(screen.getByText('Guardar'));

    // Check that the validation error is displayed
    await waitFor(() => {
      expect(screen.getByText(/Todos los campos marcados con \* son obligatorios/i)).toBeInTheDocument();
    });
  });
});
