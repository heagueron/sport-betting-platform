import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MarketsList from './MarketsList';
import adminService from '../../../../services/admin.service';

// Mock the services
jest.mock('../../../../services/admin.service', () => ({
  getMarkets: jest.fn(),
  suspendMarket: jest.fn(),
  reopenMarket: jest.fn(),
  closeMarket: jest.fn(),
  cancelMarket: jest.fn()
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

describe('MarketsList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mock implementations for each test
    (adminService.getMarkets as jest.Mock).mockResolvedValue({
      data: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10
      }
    });

    (adminService.suspendMarket as jest.Mock).mockResolvedValue({
      data: {
        id: '1',
        name: 'Test Market',
        status: 'SUSPENDED'
      }
    });

    (adminService.reopenMarket as jest.Mock).mockResolvedValue({
      data: {
        id: '1',
        name: 'Test Market',
        status: 'OPEN'
      }
    });

    (adminService.closeMarket as jest.Mock).mockResolvedValue({
      data: {
        id: '1',
        name: 'Test Market',
        status: 'CLOSED'
      }
    });

    (adminService.cancelMarket as jest.Mock).mockResolvedValue({
      data: {
        id: '1',
        name: 'Test Market',
        status: 'CANCELLED'
      }
    });
  });

  test('renders loading state initially', () => {
    render(
      <BrowserRouter>
        <MarketsList />
      </BrowserRouter>
    );

    expect(screen.getByText(/Cargando mercados/i)).toBeInTheDocument();
  });

  test('renders empty state when no markets are available', async () => {
    // Mock the getMarkets function to return an empty array
    (adminService.getMarkets as jest.Mock).mockResolvedValueOnce({
      data: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10
      }
    });

    render(
      <BrowserRouter>
        <MarketsList />
      </BrowserRouter>
    );

    // Wait for the loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText(/Cargando mercados/i)).not.toBeInTheDocument();
    });

    // Check that the empty state message is displayed
    expect(screen.getByText(/No hay mercados disponibles/i)).toBeInTheDocument();
  });

  test('renders markets list when markets are available', async () => {
    // Mock the getMarkets function to return some markets
    (adminService.getMarkets as jest.Mock).mockResolvedValueOnce({
      data: [
        {
          id: '1',
          name: 'Market 1',
          event: {
            name: 'Football Match',
            startTime: '2023-01-01T12:00:00Z',
            participants: [
              { name: 'Team A' },
              { name: 'Team B' }
            ]
          },
          status: 'OPEN',
          createdAt: '2023-01-01T10:00:00Z'
        },
        {
          id: '2',
          name: 'Market 2',
          event: {
            name: 'Basketball Game',
            startTime: '2023-01-02T15:00:00Z',
            participants: [
              { name: 'Team C' },
              { name: 'Team D' }
            ]
          },
          status: 'SUSPENDED',
          createdAt: '2023-01-01T11:00:00Z'
        }
      ],
      pagination: {
        total: 2,
        page: 1,
        limit: 10
      }
    });

    render(
      <BrowserRouter>
        <MarketsList />
      </BrowserRouter>
    );

    // Wait for the loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText(/Cargando mercados/i)).not.toBeInTheDocument();
    });

    // Check that the markets are displayed
    expect(screen.getByText('Market 1')).toBeInTheDocument();
    expect(screen.getByText('Market 2')).toBeInTheDocument();
    expect(screen.getByText('Football Match')).toBeInTheDocument();
    expect(screen.getByText('Basketball Game')).toBeInTheDocument();

    // Check that the participants are displayed
    const teamAElements = screen.queryAllByText(/Team A/);
    const teamBElements = screen.queryAllByText(/Team B/);
    const teamCElements = screen.queryAllByText(/Team C/);
    const teamDElements = screen.queryAllByText(/Team D/);

    expect(teamAElements.length).toBeGreaterThan(0);
    expect(teamBElements.length).toBeGreaterThan(0);
    expect(teamCElements.length).toBeGreaterThan(0);
    expect(teamDElements.length).toBeGreaterThan(0);
  });

  test('navigates to create market page when clicking on Crear Nuevo Mercado button', async () => {
    const navigateMock = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(navigateMock);

    render(
      <BrowserRouter>
        <MarketsList />
      </BrowserRouter>
    );

    // Wait for the loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText(/Cargando mercados/i)).not.toBeInTheDocument();
    });

    // Click on the create button
    fireEvent.click(screen.getByText('Crear Nuevo Mercado'));

    // Check that the navigate function was called with the correct path
    expect(navigateMock).toHaveBeenCalledWith('/admin/markets/create');
  });

  test('calls suspendMarket when clicking on Suspender button', async () => {
    // Mock the getMarkets function to return a market with OPEN status
    (adminService.getMarkets as jest.Mock).mockResolvedValueOnce({
      data: [
        {
          id: '1',
          name: 'Market 1',
          event: {
            name: 'Football Match',
            startTime: '2023-01-01T12:00:00Z',
            participants: [
              { name: 'Team A' },
              { name: 'Team B' }
            ]
          },
          status: 'OPEN',
          createdAt: '2023-01-01T10:00:00Z'
        }
      ],
      pagination: {
        total: 1,
        page: 1,
        limit: 10
      }
    });

    render(
      <BrowserRouter>
        <MarketsList />
      </BrowserRouter>
    );

    // Wait for the loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText(/Cargando mercados/i)).not.toBeInTheDocument();
    });

    // Click on the suspend button
    fireEvent.click(screen.getByText('Susp'));

    // Check that the suspendMarket function was called with the correct ID
    expect(adminService.suspendMarket).toHaveBeenCalledWith('1');
  });

  test('calls reopenMarket when clicking on Reactivar button', async () => {
    // Mock the getMarkets function to return a market with SUSPENDED status
    (adminService.getMarkets as jest.Mock).mockResolvedValueOnce({
      data: [
        {
          id: '1',
          name: 'Market 1',
          event: {
            name: 'Football Match',
            startTime: '2023-01-01T12:00:00Z',
            participants: [
              { name: 'Team A' },
              { name: 'Team B' }
            ]
          },
          status: 'SUSPENDED',
          createdAt: '2023-01-01T10:00:00Z'
        }
      ],
      pagination: {
        total: 1,
        page: 1,
        limit: 10
      }
    });

    render(
      <BrowserRouter>
        <MarketsList />
      </BrowserRouter>
    );

    // Wait for the loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText(/Cargando mercados/i)).not.toBeInTheDocument();
    });

    // Click on the reopen button
    fireEvent.click(screen.getByText('React'));

    // Check that the reopenMarket function was called with the correct ID
    expect(adminService.reopenMarket).toHaveBeenCalledWith('1');
  });
});
