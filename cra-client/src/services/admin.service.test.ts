import adminService from './admin.service';

// Mock the apiClient directly in the admin service
jest.mock('./api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() }
  }
}));

// Import the mocked apiClient
import apiClient from './api';

describe('Admin Service - Markets', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mock implementations for each test
    (apiClient.get as jest.Mock).mockResolvedValue({ data: {} });
    (apiClient.post as jest.Mock).mockResolvedValue({ data: {} });
    (apiClient.put as jest.Mock).mockResolvedValue({ data: {} });
    (apiClient.delete as jest.Mock).mockResolvedValue({ data: {} });
  });

  test('getMarkets should call the correct endpoint', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: [
          {
            id: '1',
            name: 'Market 1',
            eventId: '1',
            status: 'OPEN'
          }
        ],
        pagination: {
          total: 1,
          page: 1,
          limit: 10
        }
      }
    };

    (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

    await adminService.getMarkets({ page: 1, limit: 10 });

    expect(apiClient.get).toHaveBeenCalledWith('/markets', {
      params: { page: 1, limit: 10 }
    });
  });

  test('getMarketById should call the correct endpoint', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: {
          id: '1',
          name: 'Market 1',
          eventId: '1',
          status: 'OPEN'
        }
      }
    };

    (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

    await adminService.getMarketById('1');

    expect(apiClient.get).toHaveBeenCalledWith('/markets/1');
  });

  test('createMarket should call the correct endpoint with data', async () => {
    const marketData = {
      name: 'New Market',
      eventId: '1'
    };

    const mockResponse = {
      data: {
        success: true,
        data: {
          id: '1',
          ...marketData,
          status: 'OPEN'
        }
      }
    };

    (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

    await adminService.createMarket(marketData);

    expect(apiClient.post).toHaveBeenCalledWith('/markets', marketData);
  });

  test('suspendMarket should call the correct endpoint', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: {
          id: '1',
          name: 'Market 1',
          eventId: '1',
          status: 'SUSPENDED'
        }
      }
    };

    (apiClient.put as jest.Mock).mockResolvedValueOnce(mockResponse);

    await adminService.suspendMarket('1');

    expect(apiClient.put).toHaveBeenCalledWith('/markets/1/suspend', {});
  });

  test('reopenMarket should call the correct endpoint', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: {
          id: '1',
          name: 'Market 1',
          eventId: '1',
          status: 'OPEN'
        }
      }
    };

    (apiClient.put as jest.Mock).mockResolvedValueOnce(mockResponse);

    await adminService.reopenMarket('1');

    expect(apiClient.put).toHaveBeenCalledWith('/markets/1/reopen', {});
  });

  test('closeMarket should call the correct endpoint', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: {
          id: '1',
          name: 'Market 1',
          eventId: '1',
          status: 'CLOSED'
        }
      }
    };

    (apiClient.put as jest.Mock).mockResolvedValueOnce(mockResponse);

    await adminService.closeMarket('1');

    expect(apiClient.put).toHaveBeenCalledWith('/markets/1/close', {});
  });

  test('cancelMarket should call the correct endpoint', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: {
          id: '1',
          name: 'Market 1',
          eventId: '1',
          status: 'CANCELLED'
        }
      }
    };

    (apiClient.put as jest.Mock).mockResolvedValueOnce(mockResponse);

    await adminService.cancelMarket('1');

    expect(apiClient.put).toHaveBeenCalledWith('/markets/1/cancel', {});
  });
});
