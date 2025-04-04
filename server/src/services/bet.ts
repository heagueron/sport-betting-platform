import { Bet, BetStatus, User } from '@prisma/client';
import prisma from '../config/prisma';
import { BetData } from '../types';

/**
 * Create a new bet
 * @param userId User ID
 * @param betData Bet data
 * @returns Newly created bet
 */
export const createNewBet = async (
  userId: string,
  betData: BetData
): Promise<Bet> => {
  // Calculate potential winnings
  const potentialWinnings = betData.amount * betData.odds;

  // Create bet in a transaction to handle balance update
  const bet = await prisma.$transaction(async (tx) => {
    // Get user
    const user = await tx.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if user has enough balance
    if (user.balance < betData.amount) {
      throw new Error('Insufficient balance');
    }

    // Get event
    const event = await tx.event.findUnique({
      where: { id: betData.eventId },
      include: { participants: true }
    });

    if (!event) {
      throw new Error('Event not found');
    }

    // Check if event is accepting bets
    if (event.status !== 'SCHEDULED' && event.status !== 'LIVE') {
      throw new Error('Event is not accepting bets');
    }

    // Check if selection is valid
    const validSelection = event.participants.some(p => p.name === betData.selection);
    if (!validSelection) {
      throw new Error('Invalid selection');
    }

    // Update user balance
    await tx.user.update({
      where: { id: userId },
      data: { balance: user.balance - betData.amount }
    });

    // Create bet
    return tx.bet.create({
      data: {
        amount: betData.amount,
        odds: betData.odds,
        selection: betData.selection,
        potentialWinnings,
        userId,
        eventId: betData.eventId
      }
    });
  });

  return bet;
};

/**
 * Get all bets
 * @param page Page number
 * @param limit Items per page
 * @returns List of bets with pagination info
 */
export const getAllBets = async (
  page: number = 1,
  limit: number = 10
): Promise<{ bets: Bet[]; total: number; page: number; pages: number }> => {
  // Calculate pagination
  const skip = (page - 1) * limit;

  // Get total count
  const total = await prisma.bet.count();

  // Get bets
  const bets = await prisma.bet.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      event: {
        include: {
          sport: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit
  });

  // Calculate total pages
  const pages = Math.ceil(total / limit);

  return {
    bets,
    total,
    page,
    pages
  };
};

/**
 * Get user bets
 * @param userId User ID
 * @param page Page number
 * @param limit Items per page
 * @returns List of user bets with pagination info
 */
export const getUserBets = async (
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<{ bets: Bet[]; total: number; page: number; pages: number }> => {
  // Calculate pagination
  const skip = (page - 1) * limit;

  // Get total count
  const total = await prisma.bet.count({
    where: { userId }
  });

  // Get bets
  const bets = await prisma.bet.findMany({
    where: { userId },
    include: {
      event: {
        include: {
          sport: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit
  });

  // Calculate total pages
  const pages = Math.ceil(total / limit);

  return {
    bets,
    total,
    page,
    pages
  };
};

/**
 * Get bet by ID
 * @param betId Bet ID
 * @returns Bet if found
 */
export const getBetById = async (betId: string): Promise<Bet | null> => {
  return prisma.bet.findUnique({
    where: { id: betId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      event: {
        include: {
          sport: true,
          participants: true
        }
      }
    }
  });
};

/**
 * Settle a bet
 * @param betId Bet ID
 * @param status New status
 * @returns Updated bet
 */
export const settleBetById = async (
  betId: string,
  status: BetStatus
): Promise<Bet | null> => {
  // Only allow settling pending bets
  const bet = await prisma.bet.findUnique({
    where: { id: betId },
    include: { user: true }
  });

  if (!bet || bet.status !== 'PENDING') {
    return null;
  }

  // Update bet in a transaction to handle balance update for winning bets
  return prisma.$transaction(async (tx) => {
    // Update bet status
    const updatedBet = await tx.bet.update({
      where: { id: betId },
      data: { status }
    });

    // If bet is won, update user balance
    if (status === 'WON') {
      await tx.user.update({
        where: { id: bet.userId },
        data: { balance: bet.user.balance + bet.potentialWinnings }
      });
    }
    // If bet is cancelled, refund the bet amount
    else if (status === 'CANCELLED') {
      await tx.user.update({
        where: { id: bet.userId },
        data: { balance: bet.user.balance + bet.amount }
      });
    }

    return updatedBet;
  });
};

/**
 * Settle bets for an event
 * @param eventId Event ID
 * @param winningSelection Winning selection
 * @returns Number of bets settled
 */
export const settleBetsForEvent = async (
  eventId: string,
  winningSelection: string
): Promise<number> => {
  // Get all pending bets for the event
  const pendingBets = await prisma.bet.findMany({
    where: {
      eventId,
      status: 'PENDING'
    },
    include: { user: true }
  });

  // No bets to settle
  if (pendingBets.length === 0) {
    return 0;
  }

  // Settle bets in a transaction
  await prisma.$transaction(async (tx) => {
    for (const bet of pendingBets) {
      // Determine bet status
      const status: BetStatus = bet.selection === winningSelection ? 'WON' : 'LOST';

      // Update bet status
      await tx.bet.update({
        where: { id: bet.id },
        data: { status }
      });

      // If bet is won, update user balance
      if (status === 'WON') {
        await tx.user.update({
          where: { id: bet.userId },
          data: { balance: bet.user.balance + bet.potentialWinnings }
        });
      }
    }
  });

  return pendingBets.length;
};

/**
 * Get user balance
 * @param userId User ID
 * @returns User balance
 */
export const getUserBalance = async (userId: string): Promise<number> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { balance: true }
  });

  return user ? user.balance : 0;
};

/**
 * Update user balance
 * @param userId User ID
 * @param amount Amount to add (positive) or subtract (negative)
 * @returns Updated user
 */
export const updateUserBalance = async (
  userId: string,
  amount: number
): Promise<User | null> => {
  // Get user
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    return null;
  }

  // Check if user has enough balance for negative amounts
  if (amount < 0 && user.balance + amount < 0) {
    throw new Error('Insufficient balance');
  }

  // Update balance
  return prisma.user.update({
    where: { id: userId },
    data: { balance: user.balance + amount }
  });
};
