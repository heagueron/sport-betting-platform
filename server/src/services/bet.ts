import { Bet, BetStatus, BetType, User, PrismaClient, TransactionType, TransactionStatus } from '@prisma/client';
import prisma from '../config/prisma';
import { BetData } from '../types';
import * as betMatchingService from './betMatching';
import * as concurrencyService from './concurrency';
import { AppError } from '../utils/errors';

/**
 * Create a new back bet
 * @param userId User ID
 * @param betData Bet data
 * @returns Newly created bet
 */
export const createBackBet = async (
  userId: string,
  betData: BetData
): Promise<Bet> => {
  // Calculate potential winnings
  const potentialWinnings = betData.amount * betData.odds;

  // Usar el servicio de concurrencia para manejar reintentos en caso de conflictos
  const bet = await concurrencyService.withRetry(async () => {
    // Create bet in a transaction with aislamiento serializable
    return prisma.$transaction(async (tx) => {
    // Get user
    const user = await tx.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if user has enough balance
    if (user.availableBalance < betData.amount) {
      throw new AppError('Insufficient balance', 400);
    }

    // Get market
    const market = await tx.market.findUnique({
      where: { id: betData.marketId },
      include: {
        event: {
          include: {
            participants: true
          }
        }
      }
    });

    if (!market) {
      throw new AppError('Market not found', 404);
    }

    // Check if market is open
    if (market.status !== 'OPEN') {
      throw new AppError('Market is not open for betting', 400);
    }

    // Check if event is accepting bets
    if (market.event.status !== 'SCHEDULED' && market.event.status !== 'LIVE') {
      throw new AppError('Event is not accepting bets', 400);
    }

    // Check if selection is valid
    const validSelection = market.event.participants.some(p => p.name === betData.selection);
    if (!validSelection) {
      throw new AppError('Invalid selection', 400);
    }

    // Update user balance
    // Usar bloqueo optimista para evitar condiciones de carrera
    await tx.user.update({
      where: {
        id: userId,
        version: user.version // Asegurar que nadie más ha modificado el usuario
      },
      data: {
        balance: user.balance - betData.amount,
        availableBalance: user.availableBalance - betData.amount,
        version: { increment: 1 } // Incrementar la versión
      }
    });

    // Registrar la transacción
    await tx.transaction.create({
      data: {
        userId,
        type: 'BET' as TransactionType,
        amount: betData.amount,
        status: TransactionStatus.COMPLETADA,
        description: `Apuesta BACK en ${betData.selection} a cuota ${betData.odds}`
      }
    });

    // Create bet
    return tx.bet.create({
      data: {
        amount: betData.amount,
        odds: betData.odds,
        selection: betData.selection,
        potentialWinnings,
        type: BetType.BACK,
        matchedAmount: 0,
        userId,
        eventId: betData.eventId,
        marketId: betData.marketId
      }
    });
    });
  }, 3); // Máximo 3 reintentos

  // Try to match the bet asíncronamente para no bloquear la respuesta
  setTimeout(async () => {
    try {
      await betMatchingService.matchBet(bet.id);
    } catch (error) {
      console.error('Error matching bet:', error);
    }
  }, 0);

  // Return the bet with fresh data after matching
  return prisma.bet.findUnique({
    where: { id: bet.id },
    include: {
      user: {
        select: {
          id: true,
          name: true
        }
      },
      event: true,
      market: true
    }
  }) as Promise<Bet>;
};

/**
 * Create a new lay bet
 * @param userId User ID
 * @param betData Bet data
 * @returns Newly created bet
 */
export const createLayBet = async (
  userId: string,
  betData: BetData
): Promise<Bet> => {
  // Calculate liability (potential loss)
  const liability = betData.amount * (betData.odds - 1);

  // Usar el servicio de concurrencia para manejar reintentos en caso de conflictos
  const bet = await concurrencyService.withRetry(async () => {
    // Create bet in a transaction with aislamiento serializable
    return prisma.$transaction(async (tx) => {
    // Get user
    const user = await tx.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if user has enough balance to cover liability
    if (user.availableBalance < liability) {
      throw new AppError('Insufficient balance to cover liability', 400);
    }

    // Get market
    const market = await tx.market.findUnique({
      where: { id: betData.marketId },
      include: {
        event: {
          include: {
            participants: true
          }
        }
      }
    });

    if (!market) {
      throw new AppError('Market not found', 404);
    }

    // Check if market is open
    if (market.status !== 'OPEN') {
      throw new AppError('Market is not open for betting', 400);
    }

    // Check if event is accepting bets
    if (market.event.status !== 'SCHEDULED' && market.event.status !== 'LIVE') {
      throw new AppError('Event is not accepting bets', 400);
    }

    // Check if selection is valid
    const validSelection = market.event.participants.some(p => p.name === betData.selection);
    if (!validSelection) {
      throw new AppError('Invalid selection', 400);
    }

    // Update user balance - reserve the liability amount
    // Usar bloqueo optimista para evitar condiciones de carrera
    await tx.user.update({
      where: {
        id: userId,
        version: user.version // Asegurar que nadie más ha modificado el usuario
      },
      data: {
        availableBalance: user.availableBalance - liability,
        reservedBalance: user.reservedBalance + liability,
        version: { increment: 1 } // Incrementar la versión
      }
    });

    // Registrar la transacción
    await tx.transaction.create({
      data: {
        userId,
        type: 'RESERVE' as TransactionType,
        amount: liability,
        status: TransactionStatus.COMPLETADA,
        description: `Reserva de fondos para apuesta LAY en ${betData.selection} a cuota ${betData.odds}`
      }
    });

    // Create bet
    return tx.bet.create({
      data: {
        amount: betData.amount,
        odds: betData.odds,
        selection: betData.selection,
        potentialWinnings: betData.amount, // For lay bets, potential winnings is the stake
        liability,
        matchedAmount: 0,
        userId,
        eventId: betData.eventId,
        marketId: betData.marketId
      }
    });
    });
  }, 3); // Máximo 3 reintentos

  // Try to match the bet asíncronamente para no bloquear la respuesta
  setTimeout(async () => {
    try {
      await betMatchingService.matchBet(bet.id);
    } catch (error) {
      console.error('Error matching bet:', error);
    }
  }, 0);

  // Return the bet with fresh data after matching
  return prisma.bet.findUnique({
    where: { id: bet.id },
    include: {
      user: {
        select: {
          id: true,
          name: true
        }
      },
      event: true,
      market: true
    }
  }) as Promise<Bet>;
};

/**
 * Cancel an unmatched bet
 * @param betId Bet ID
 * @param userId User ID (for authorization)
 * @returns Cancelled bet
 */
export const cancelUnmatchedBet = async (
  betId: string,
  userId: string
): Promise<Bet> => {
  // Get the bet
  const bet = await prisma.bet.findUnique({
    where: { id: betId },
    include: { user: true }
  });

  if (!bet) {
    throw new AppError('Bet not found', 404);
  }

  // Check if user owns the bet
  if (bet.userId !== userId) {
    throw new AppError('Unauthorized', 403);
  }

  // Only allow cancelling unmatched or partially matched bets
  if (bet.status !== BetStatus.UNMATCHED && bet.status !== BetStatus.PARTIALLY_MATCHED) {
    throw new AppError('Bet cannot be cancelled', 400);
  }

  // Calculate refund amount
  const refundAmount = bet.amount - bet.matchedAmount;

  // Usar el servicio de concurrencia para manejar reintentos en caso de conflictos
  return concurrencyService.withRetry(async () => {
    // Cancel bet in a transaction with aislamiento serializable
    return prisma.$transaction(async (tx) => {
    // Update bet status
    const updatedBet = await tx.bet.update({
      where: { id: betId },
      data: {
        status: BetStatus.CANCELLED,
        settledAt: new Date()
      }
    });

    // Refund the unmatched amount
    if (bet.type === BetType.BACK) {
      // Usar bloqueo optimista para evitar condiciones de carrera
      await tx.user.update({
        where: {
          id: bet.userId,
          version: bet.user.version // Asegurar que nadie más ha modificado el usuario
        },
        data: {
          balance: bet.user.balance + refundAmount,
          availableBalance: bet.user.availableBalance + refundAmount,
          version: { increment: 1 } // Incrementar la versión
        }
      });

      // Registrar la transacción de reembolso
      await tx.transaction.create({
        data: {
          userId: bet.userId,
          type: 'REFUND' as TransactionType,
          amount: refundAmount,
          status: TransactionStatus.COMPLETADA,
          description: `Reembolso por cancelación de apuesta BACK en ${bet.selection} a cuota ${bet.odds}`
        }
      });
    } else if (bet.type === BetType.LAY && bet.liability) {
      // For lay bets, release the reserved liability proportionally
      const liabilityToRelease = bet.liability * (refundAmount / bet.amount);

      // Usar bloqueo optimista para evitar condiciones de carrera
      await tx.user.update({
        where: {
          id: bet.userId,
          version: bet.user.version // Asegurar que nadie más ha modificado el usuario
        },
        data: {
          availableBalance: bet.user.availableBalance + liabilityToRelease,
          reservedBalance: bet.user.reservedBalance - liabilityToRelease,
          version: { increment: 1 } // Incrementar la versión
        }
      });

      // Registrar la transacción de liberación de fondos
      await tx.transaction.create({
        data: {
          userId: bet.userId,
          type: 'RELEASE' as TransactionType,
          amount: liabilityToRelease,
          status: TransactionStatus.COMPLETADA,
          description: `Liberación de fondos por cancelación de apuesta LAY en ${bet.selection} a cuota ${bet.odds}`
        }
      });
    }

    return updatedBet;
    });
  }, 3); // Máximo 3 reintentos
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
      },
      market: true
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
      },
      market: true,
      asBackBet: {
        include: {
          layBet: {
            select: {
              id: true,
              odds: true,
              amount: true,
              user: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      },
      asLayBet: {
        include: {
          backBet: {
            select: {
              id: true,
              odds: true,
              amount: true,
              user: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
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
      },
      market: true,
      asBackBet: {
        include: {
          layBet: {
            select: {
              id: true,
              odds: true,
              amount: true,
              user: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      },
      asLayBet: {
        include: {
          backBet: {
            select: {
              id: true,
              odds: true,
              amount: true,
              user: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      }
    }
  });
};

/**
 * Get user balance
 * @param userId User ID
 * @returns User balance info
 */
export const getUserBalance = async (userId: string): Promise<{
  balance: number;
  availableBalance: number;
  reservedBalance: number;
}> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      balance: true,
      availableBalance: true,
      reservedBalance: true
    }
  });

  if (!user) {
    return {
      balance: 0,
      availableBalance: 0,
      reservedBalance: 0
    };
  }

  return {
    balance: user.balance,
    availableBalance: user.availableBalance,
    reservedBalance: user.reservedBalance
  };
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
  if (amount < 0 && user.availableBalance + amount < 0) {
    throw new AppError('Insufficient balance', 400);
  }

  // Update balance
  return prisma.user.update({
    where: { id: userId },
    data: {
      balance: user.balance + amount,
      availableBalance: user.availableBalance + amount
    }
  });
};
