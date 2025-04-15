import { Request, Response, NextFunction } from 'express';
import * as marketService from '../services/market';
import { MarketStatus } from '@prisma/client';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/appError';

/**
 * Create a new market
 * @route POST /api/markets
 */
export const createMarket = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { eventId, name, status } = req.body;

    const market = await marketService.createMarket(eventId, { name, status });

    res.status(201).json({
      success: true,
      data: market
    });
  }
);

/**
 * Get all markets
 * @route GET /api/markets
 */
export const getAllMarkets = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const { markets, total, pages } = await marketService.getAllMarkets(page, limit);

    res.status(200).json({
      success: true,
      data: markets,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    });
  }
);

/**
 * Get markets by event ID
 * @route GET /api/events/:id/markets
 */
export const getMarketsByEvent = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const eventId = req.params.id;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const { markets, total, pages } = await marketService.getMarketsByEvent(eventId, page, limit);

    res.status(200).json({
      success: true,
      data: markets,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    });
  }
);

/**
 * Get market by ID
 * @route GET /api/markets/:id
 */
export const getMarketById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const marketId = req.params.id;

    const market = await marketService.getMarketById(marketId);

    if (!market) {
      return next(new AppError('Market not found', 404));
    }

    res.status(200).json({
      success: true,
      data: market
    });
  }
);

/**
 * Update market status
 * @route PUT /api/markets/:id/status
 */
export const updateMarketStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const marketId = req.params.id;
    const { status } = req.body;

    // Validate status
    if (!Object.values(MarketStatus).includes(status)) {
      return next(new AppError('Invalid market status', 400));
    }

    const market = await marketService.updateMarketStatus(marketId, status);

    res.status(200).json({
      success: true,
      data: market
    });
  }
);

/**
 * Settle market
 * @route PUT /api/markets/:id/settle
 */
export const settleMarket = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const marketId = req.params.id;
    const { winningSelection } = req.body;

    if (!winningSelection) {
      return next(new AppError('Winning selection is required', 400));
    }

    const settledCount = await marketService.settleMarket(marketId, winningSelection);

    res.status(200).json({
      success: true,
      data: {
        marketId,
        winningSelection,
        settledCount
      }
    });
  }
);

/**
 * Get order book for a market
 * @route GET /api/markets/:id/orderbook
 */
export const getOrderBook = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const marketId = req.params.id;

    const orderBook = await marketService.getOrderBook(marketId);

    res.status(200).json({
      success: true,
      data: orderBook
    });
  }
);
