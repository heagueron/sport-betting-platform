import { Request, Response, NextFunction } from 'express';
import { BetStatus } from '@prisma/client';
import {
  createNewBet,
  getAllBets,
  getUserBets,
  getBetById,
  settleBetById,
  settleBetsForEvent,
  getUserBalance,
  updateUserBalance
} from '../services/bet';
import { getEventById } from '../services/event';

// @desc    Create new bet
// @route   POST /api/bets
// @access  Private
export const createBet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { eventId, amount, odds, selection } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!eventId || !amount || !odds || !selection) {
      return res.status(400).json({
        success: false,
        error: 'Please provide eventId, amount, odds, and selection'
      });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Bet amount must be greater than 0'
      });
    }

    // Validate odds
    if (odds <= 1) {
      return res.status(400).json({
        success: false,
        error: 'Odds must be greater than 1'
      });
    }

    try {
      // Create bet
      const bet = await createNewBet(userId, { eventId, amount, odds, selection });

      res.status(201).json({
        success: true,
        data: bet
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bets
// @route   GET /api/bets
// @access  Private/Admin
export const getBets = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Parse query parameters
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '10', 10);

    // Get bets
    const result = await getAllBets(page, limit);

    res.status(200).json({
      success: true,
      count: result.total,
      pagination: {
        page: result.page,
        pages: result.pages,
        total: result.total
      },
      data: result.bets
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user bets
// @route   GET /api/bets/user
// @access  Private
export const getUserBetsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;

    // Parse query parameters
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '10', 10);

    // Get user bets
    const result = await getUserBets(userId, page, limit);

    res.status(200).json({
      success: true,
      count: result.total,
      pagination: {
        page: result.page,
        pages: result.pages,
        total: result.total
      },
      data: result.bets
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single bet
// @route   GET /api/bets/:id
// @access  Private
export const getBet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const betId = req.params.id;
    const userId = req.user.id;

    // Get bet
    const bet = await getBetById(betId);

    // Check if bet exists
    if (!bet) {
      return res.status(404).json({
        success: false,
        error: 'Bet not found'
      });
    }

    // Check if user owns the bet or is admin
    if (bet.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this bet'
      });
    }

    res.status(200).json({
      success: true,
      data: bet
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Settle bet
// @route   PUT /api/bets/:id/settle
// @access  Private/Admin
export const settleBet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const betId = req.params.id;
    const { status } = req.body;

    // Validate status
    if (!status || !['WON', 'LOST', 'CANCELLED'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid status: WON, LOST, or CANCELLED'
      });
    }

    // Settle bet
    const updatedBet = await settleBetById(betId, status as BetStatus);

    // Check if bet exists and was settled
    if (!updatedBet) {
      return res.status(404).json({
        success: false,
        error: 'Bet not found or already settled'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedBet
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Settle bets for an event
// @route   PUT /api/bets/event/:id/settle
// @access  Private/Admin
export const settleEventBets = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const eventId = req.params.id;
    const { winningSelection } = req.body;

    // Validate input
    if (!winningSelection) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a winning selection'
      });
    }

    // Check if event exists
    const event = await getEventById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Check if event is completed
    if (event.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        error: 'Event must be completed before settling bets'
      });
    }

    // Check if winning selection is valid
    const validSelection = event.participants.some(p => p.name === winningSelection);
    if (!validSelection) {
      return res.status(400).json({
        success: false,
        error: 'Invalid winning selection'
      });
    }

    // Settle bets
    const settledCount = await settleBetsForEvent(eventId, winningSelection);

    res.status(200).json({
      success: true,
      message: `${settledCount} bets settled successfully`,
      data: { settledCount }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user balance
// @route   GET /api/bets/balance
// @access  Private
export const getBalance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;

    // Get user balance
    const balance = await getUserBalance(userId);

    res.status(200).json({
      success: true,
      data: { balance }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user balance (deposit/withdraw)
// @route   PUT /api/bets/balance
// @access  Private
export const updateBalance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;

    // Validate amount
    if (!amount || isNaN(amount)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid amount'
      });
    }

    try {
      // Update balance
      const user = await updateUserBalance(userId, parseFloat(amount));

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        data: { balance: user.balance }
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};
