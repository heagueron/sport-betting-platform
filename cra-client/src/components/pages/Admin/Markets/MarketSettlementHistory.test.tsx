import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MarketSettlementHistory from './MarketSettlementHistory';
import adminService from '../../../../services/admin.service';

// Mock the admin service
jest.mock('../../../../services/admin.service');

describe('MarketSettlementHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('displays loading state initially', () => {
    // Mock the getMarkets function to return a promise that never resolves
    (adminService.getMarkets as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(
      <BrowserRouter>
        <MarketSettlementHistory />
      </BrowserRouter>
    );

    expect(screen.getByText(/Cargando mercados liquidados/i)).toBeInTheDocument();
  });

  test('displays empty state when no settled markets are available', async () => {
    // Mock the getMarkets function to return an empty array
    (adminService.getMarkets as jest.Mock).mockResolvedValueOnce({
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
      }
    });

    render(
      <BrowserRouter>
        <MarketSettlementHistory />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No hay mercados liquidados disponibles/i)).toBeInTheDocument();
    });
  });

  test('displays settled markets when available', async () => {
    // Mock the getMarkets function to return some settled markets
    (adminService.getMarkets as jest.Mock).mockResolvedValueOnce({
      data: [
        {
          id: '1',
          name: 'Market 1',
          status: 'SETTLED',
          winningSelection: 'Team A',
          settledAt: '2023-01-01T12:00:00Z',
          createdAt: '2023-01-01T10:00:00Z',
          updatedAt: '2023-01-01T12:00:00Z',
          eventId: '1',
          event: {
            id: '1',
            name: 'Event 1',
            startTime: '2023-01-01T11:00:00Z',
            participants: [
              { name: 'Team A' },
              { name: 'Team B' }
            ]
          }
        },
        {
          id: '2',
          name: 'Market 2',
          status: 'SETTLED',
          winningSelection: 'Team X',
          settledAt: '2023-01-02T12:00:00Z',
          createdAt: '2023-01-02T10:00:00Z',
          updatedAt: '2023-01-02T12:00:00Z',
          eventId: '2',
          event: {
            id: '2',
            name: 'Event 2',
            startTime: '2023-01-02T11:00:00Z',
            participants: [
              { name: 'Team X' },
              { name: 'Team Y' }
            ]
          }
        }
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        pages: 1
      }
    });

    render(
      <BrowserRouter>
        <MarketSettlementHistory />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Market 1')).toBeInTheDocument();
      expect(screen.getByText('Market 2')).toBeInTheDocument();
      expect(screen.getByText('Event 1')).toBeInTheDocument();
      expect(screen.getByText('Event 2')).toBeInTheDocument();
      expect(screen.getAllByText('Team A')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Team X')[0]).toBeInTheDocument();
    });
  });

  test('handles error state', async () => {
    // Mock the getMarkets function to throw an error
    (adminService.getMarkets as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

    render(
      <BrowserRouter>
        <MarketSettlementHistory />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Error al cargar los mercados liquidados/i)).toBeInTheDocument();
    });
  });
});
