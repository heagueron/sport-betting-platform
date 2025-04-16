import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MarketCreate from './MarketCreate';
import adminService from '../../../../services/admin.service';

// Mock the services
jest.mock('../../../../services/admin.service', () => ({
  getEvents: jest.fn(),
  createMarket: jest.fn()
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

describe('MarketCreate Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mock implementations for each test
    (adminService.getEvents as jest.Mock).mockResolvedValue({
      data: []
    });

    (adminService.createMarket as jest.Mock).mockResolvedValue({
      data: {
        id: '1',
        name: 'Test Market',
        eventId: '1',
        status: 'OPEN'
      }
    });
  });

  test('renders loading state initially', () => {
    render(
      <BrowserRouter>
        <MarketCreate />
      </BrowserRouter>
    );

    expect(screen.getByText(/Cargando eventos/i)).toBeInTheDocument();
  });

  test('renders form when events are loaded', async () => {
    // Mock the getEvents function to return some events
    (adminService.getEvents as jest.Mock).mockResolvedValueOnce({
      data: [
        {
          id: '1',
          name: 'Football Match',
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
          sport: { name: 'Basketball' },
          startTime: '2023-01-02T15:00:00Z',
          status: 'SCHEDULED',
          participants: [
            { name: 'Team C', odds: 1.8 },
            { name: 'Team D', odds: 2.2 }
          ]
        }
      ]
    });

    render(
      <BrowserRouter>
        <MarketCreate />
      </BrowserRouter>
    );

    // Wait for the loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText(/Cargando eventos/i)).not.toBeInTheDocument();
    });

    // Check that the form is displayed
    expect(screen.getByText('Crear Nuevo Mercado')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre del Mercado:')).toBeInTheDocument();
    expect(screen.getByLabelText('Evento:')).toBeInTheDocument();
    expect(screen.getByText('Selecciones Disponibles:')).toBeInTheDocument();
  });

  test('shows error when form is submitted with missing fields', async () => {
    // Mock the getEvents function to return some events
    (adminService.getEvents as jest.Mock).mockResolvedValueOnce({
      data: [
        {
          id: '1',
          name: 'Football Match',
          sport: { name: 'Football' },
          startTime: '2023-01-01T12:00:00Z',
          status: 'SCHEDULED',
          participants: [
            { name: 'Team A', odds: 1.5 },
            { name: 'Team B', odds: 2.5 }
          ]
        }
      ]
    });

    render(
      <BrowserRouter>
        <MarketCreate />
      </BrowserRouter>
    );

    // Wait for the loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText(/Cargando eventos/i)).not.toBeInTheDocument();
    });

    // Submit the form without filling any fields
    fireEvent.click(screen.getByText('Crear Mercado'));

    // Check that the validation error is displayed
    await waitFor(() => {
      const errorElements = screen.queryAllByText(/obligatorio/);
      expect(errorElements.length).toBeGreaterThan(0);
    });
  });

  test('calls createMarket when form is submitted with valid data', async () => {
    const navigateMock = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(navigateMock);

    // Mock the createMarket function to resolve successfully
    (adminService.createMarket as jest.Mock).mockResolvedValueOnce({
      data: {
        id: '1',
        name: 'Test Market',
        eventId: '1',
        status: 'OPEN'
      }
    });

    // Mock the getEvents function to return some events
    (adminService.getEvents as jest.Mock).mockResolvedValueOnce({
      data: [
        {
          id: '1',
          name: 'Football Match',
          sport: { name: 'Football' },
          startTime: '2023-01-01T12:00:00Z',
          status: 'SCHEDULED',
          participants: [
            { name: 'Team A', odds: 1.5 },
            { name: 'Team B', odds: 2.5 }
          ]
        }
      ]
    });

    render(
      <BrowserRouter>
        <MarketCreate />
      </BrowserRouter>
    );

    // Wait for the loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText(/Cargando eventos/i)).not.toBeInTheDocument();
    });

    // Fill the form
    fireEvent.change(screen.getByLabelText('Nombre del Mercado:'), { target: { value: 'Test Market' } });

    // For select elements, we need to find the select first, then change its value
    const eventSelect = screen.getByLabelText('Evento:');
    fireEvent.change(eventSelect, { target: { value: '1' } });

    // Add selections
    const selectionInput = screen.getByPlaceholderText('Selección 1');
    fireEvent.change(selectionInput, { target: { value: 'Team A' } });

    // Add another selection by clicking the add button and filling the new input
    fireEvent.click(screen.getByText('+ Añadir Selección'));
    const selectionInput2 = screen.getByPlaceholderText('Selección 2');
    fireEvent.change(selectionInput2, { target: { value: 'Team B' } });

    // Submit the form
    const submitButton = screen.getByText('Crear Mercado');
    fireEvent.click(submitButton);

    // Verify that the form values are correct before submission
    expect(screen.getByDisplayValue('Test Market')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Team A')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Team B')).toBeInTheDocument();

    // For the select, verify that the option with the correct text is selected
    const footballMatchElements = screen.queryAllByText(/Football Match/);
    expect(footballMatchElements.length).toBeGreaterThan(0);

    // Wait for the createMarket function to be called
    await waitFor(() => {
      expect(adminService.createMarket).toHaveBeenCalled();
    });

    // Verify that createMarket was called with the correct data
    expect(adminService.createMarket).toHaveBeenCalledWith({
      name: 'Test Market',
      eventId: '1',
      selections: ['Team A', 'Team B']
    });
  });

  test('navigates back to markets list when clicking on Cancelar button', async () => {
    const navigateMock = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(navigateMock);

    // Mock the getEvents function to return some events
    (adminService.getEvents as jest.Mock).mockResolvedValueOnce({
      data: [
        {
          id: '1',
          name: 'Football Match',
          sport: { name: 'Football' },
          startTime: '2023-01-01T12:00:00Z',
          status: 'SCHEDULED',
          participants: [
            { name: 'Team A', odds: 1.5 },
            { name: 'Team B', odds: 2.5 }
          ]
        }
      ]
    });

    render(
      <BrowserRouter>
        <MarketCreate />
      </BrowserRouter>
    );

    // Wait for the loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText(/Cargando eventos/i)).not.toBeInTheDocument();
    });

    // Click on the cancel button
    fireEvent.click(screen.getByText('Cancelar'));

    // Check that the navigate function was called to redirect to the markets list
    expect(navigateMock).toHaveBeenCalledWith('/admin/markets');
  });
});
