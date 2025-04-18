import { Request, Response, NextFunction } from 'express';
import * as marketService from '../services/market';
import { MarketStatus } from '@prisma/client';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/errors';
import { getMarketOrderBook } from '../services/betMatching';

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
    const eventId = req.query.eventId as string | undefined;
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;

    const { markets, total, pages } = await marketService.getAllMarkets(page, limit, eventId, status, search);

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
 * Suspend market
 * @route PUT /api/markets/:id/suspend
 */
export const suspendMarket = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const marketId = req.params.id;

    const market = await marketService.updateMarketStatus(marketId, MarketStatus.SUSPENDED);

    res.status(200).json({
      success: true,
      data: market
    });
  }
);

/**
 * Reopen market
 * @route PUT /api/markets/:id/reopen
 */
export const reopenMarket = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const marketId = req.params.id;

    const market = await marketService.updateMarketStatus(marketId, MarketStatus.OPEN);

    res.status(200).json({
      success: true,
      data: market
    });
  }
);

/**
 * Close market
 * @route PUT /api/markets/:id/close
 */
export const closeMarket = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const marketId = req.params.id;

    const market = await marketService.updateMarketStatus(marketId, MarketStatus.CLOSED);

    res.status(200).json({
      success: true,
      data: market
    });
  }
);

/**
 * Cancel market
 * @route PUT /api/markets/:id/cancel
 */
export const cancelMarket = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const marketId = req.params.id;

    const market = await marketService.updateMarketStatus(marketId, MarketStatus.CANCELLED);

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

    // Liquidar el mercado
    await marketService.settleMarket(marketId, winningSelection);

    // Obtener el mercado actualizado para devolverlo en la respuesta
    const updatedMarket = await marketService.getMarketById(marketId);

    if (!updatedMarket) {
      return next(new AppError('Market not found after settlement', 404));
    }

    res.status(200).json({
      success: true,
      data: updatedMarket
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
    const { selection } = req.query;

    // Check if market exists
    const market = await marketService.getMarketById(marketId);
    if (!market) {
      return next(new AppError('Market not found', 404));
    }

    // Get order book
    const orderBook = await getMarketOrderBook(
      marketId,
      selection ? String(selection) : undefined
    );

    res.status(200).json({
      success: true,
      data: orderBook
    });
  }
);
