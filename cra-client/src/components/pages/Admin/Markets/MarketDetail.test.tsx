import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MarketDetail from './MarketDetail';
import adminService from '../../../../services/admin.service';

// Mock the admin service
jest.mock('../../../../services/admin.service');

// Mock the useParams hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ marketId: '1' }),
  useNavigate: () => jest.fn()
}));

describe('MarketDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.confirm to always return true
    window.confirm = jest.fn().mockImplementation(() => true);
  });

  test('displays loading state initially', () => {
    // Mock the getMarketById function to return a promise that never resolves
    (adminService.getMarketById as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(
      <BrowserRouter>
        <MarketDetail />
      </BrowserRouter>
    );

    expect(screen.getByText(/Cargando detalles del mercado/i)).toBeInTheDocument();
  });

  test('displays market details when loaded', async () => {
    // Mock the getMarketById function to return a market
    (adminService.getMarketById as jest.Mock).mockResolvedValueOnce({
      data: {
        id: '1',
        name: 'Test Market',
        status: 'OPEN',
        createdAt: '2023-01-01T10:00:00Z',
        updatedAt: '2023-01-01T10:00:00Z',
        eventId: '1',
        event: {
          id: '1',
          name: 'Test Event',
          startTime: '2023-01-01T11:00:00Z',
          participants: [
            { name: 'Team A' },
            { name: 'Team B' }
          ]
        }
      }
    });

    render(
      <BrowserRouter>
        <MarketDetail />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Market')).toBeInTheDocument();
      expect(screen.getByText('Test Event')).toBeInTheDocument();
      expect(screen.getByText('Abierto')).toBeInTheDocument();
    });
  });

  test('allows suspending an open market', async () => {
    // Mock the getMarketById function to return an open market
    (adminService.getMarketById as jest.Mock).mockResolvedValueOnce({
      data: {
        id: '1',
        name: 'Test Market',
        status: 'OPEN',
        createdAt: '2023-01-01T10:00:00Z',
        updatedAt: '2023-01-01T10:00:00Z',
        eventId: '1',
        event: {
          id: '1',
          name: 'Test Event',
          participants: [
            { name: 'Team A' },
            { name: 'Team B' }
          ]
        }
      }
    });

    // Mock the suspendMarket function to return a suspended market
    (adminService.suspendMarket as jest.Mock).mockResolvedValueOnce({
      data: {
        id: '1',
        name: 'Test Market',
        status: 'SUSPENDED',
        createdAt: '2023-01-01T10:00:00Z',
        updatedAt: '2023-01-01T10:00:00Z',
        eventId: '1',
        event: {
          id: '1',
          name: 'Test Event',
          participants: [
            { name: 'Team A' },
            { name: 'Team B' }
          ]
        }
      }
    });

    render(
      <BrowserRouter>
        <MarketDetail />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Suspender Mercado')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Suspender Mercado'));

    await waitFor(() => {
      expect(adminService.suspendMarket).toHaveBeenCalledWith('1');
      expect(screen.getByText('Mercado suspendido correctamente')).toBeInTheDocument();
    });
  });

  test('allows settling a closed market', async () => {
    // Mock window.confirm to always return true
    window.confirm = jest.fn().mockImplementation(() => true);

    // Mock the getMarketById function to return a closed market
    (adminService.getMarketById as jest.Mock).mockResolvedValueOnce({
      data: {
        id: '1',
        name: 'Test Market',
        status: 'CLOSED',
        createdAt: '2023-01-01T10:00:00Z',
        updatedAt: '2023-01-01T10:00:00Z',
        eventId: '1',
        event: {
          id: '1',
          name: 'Test Event',
          participants: [
            { name: 'Team A' },
            { name: 'Team B' }
          ]
        }
      }
    });

    // Mock the getMarketById function for the check call
    (adminService.getMarketById as jest.Mock).mockResolvedValueOnce({
      data: {
        id: '1',
        name: 'Test Market',
        status: 'CLOSED',
        createdAt: '2023-01-01T10:00:00Z',
        updatedAt: '2023-01-01T10:00:00Z',
        eventId: '1',
        event: {
          id: '1',
          name: 'Test Event',
          participants: [
            { name: 'Team A' },
            { name: 'Team B' }
          ]
        }
      }
    });

    // Mock the settleMarket function to return a settled market
    (adminService.settleMarket as jest.Mock).mockResolvedValueOnce({
      data: {
        id: '1',
        name: 'Test Market',
        status: 'SETTLED',
        winningSelection: 'Team A',
        settledAt: '2023-01-01T12:00:00Z',
        createdAt: '2023-01-01T10:00:00Z',
        updatedAt: '2023-01-01T12:00:00Z',
        eventId: '1',
        event: {
          id: '1',
          name: 'Test Event',
          participants: [
            { name: 'Team A' },
            { name: 'Team B' }
          ]
        }
      }
    });

    render(
      <BrowserRouter>
        <MarketDetail />
      </BrowserRouter>
    );

    // Wait for the market details to load
    await waitFor(() => {
      expect(screen.getByText('Liquidar Mercado')).toBeInTheDocument();
    });

    // Select a winning option
    const selectElement = screen.getByLabelText('Seleccionar Ganador:');
    fireEvent.change(selectElement, { target: { value: 'Team A' } });

    // Verify the selection was made
    expect(selectElement).toHaveValue('Team A');

    // Get the confirm button and verify it's enabled
    const confirmButton = screen.getByText('Confirmar Liquidación');
    expect(confirmButton).not.toBeDisabled();

    // Click the confirm button
    fireEvent.click(confirmButton);

    // Verify the settleMarket function was called with the correct parameters
    await waitFor(() => {
      expect(adminService.settleMarket).toHaveBeenCalledWith('1', 'Team A');
    });

    // Verify the success message is displayed
    await waitFor(() => {
      expect(screen.getByText('Mercado liquidado correctamente')).toBeInTheDocument();
    });
  });

  test('button is disabled when no winner is selected', async () => {
    // Mock the getMarketById function to return a closed market
    (adminService.getMarketById as jest.Mock).mockResolvedValueOnce({
      data: {
        id: '1',
        name: 'Test Market',
        status: 'CLOSED',
        createdAt: '2023-01-01T10:00:00Z',
        updatedAt: '2023-01-01T10:00:00Z',
        eventId: '1',
        event: {
          id: '1',
          name: 'Test Event',
          participants: [
            { name: 'Team A' },
            { name: 'Team B' }
          ]
        }
      }
    });

    render(
      <BrowserRouter>
        <MarketDetail />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Liquidar Mercado')).toBeInTheDocument();
    });

    // Verify that the button is disabled when no winner is selected
    const confirmButton = screen.getByText('Confirmar Liquidación');
    expect(confirmButton).toBeDisabled();

    // Verify that the settleMarket function is not called
    expect(adminService.settleMarket).not.toHaveBeenCalled();
  });

  test('displays settled market with winning selection', async () => {
    // Mock the getMarketById function to return a settled market
    (adminService.getMarketById as jest.Mock).mockResolvedValueOnce({
      data: {
        id: '1',
        name: 'Test Market',
        status: 'SETTLED',
        winningSelection: 'Team A',
        settledAt: '2023-01-01T12:00:00Z',
        createdAt: '2023-01-01T10:00:00Z',
        updatedAt: '2023-01-01T12:00:00Z',
        eventId: '1',
        event: {
          id: '1',
          name: 'Test Event',
          participants: [
            { name: 'Team A' },
            { name: 'Team B' }
          ]
        }
      }
    });

    render(
      <BrowserRouter>
        <MarketDetail />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Liquidado')).toBeInTheDocument();
      expect(screen.getByText('Selección ganadora:')).toBeInTheDocument();
      expect(screen.getByText('Team A')).toBeInTheDocument();
    });
  });
});
