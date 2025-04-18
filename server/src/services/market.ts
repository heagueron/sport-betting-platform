import { Market, MarketStatus, TransactionStatus, TransactionType } from '@prisma/client';
import * as concurrencyService from './concurrency';
import prisma from '../config/prisma';
import { MarketData } from '../types';

/**
 * Create a new market for an event
 * @param eventId Event ID
 * @param marketData Market data
 * @returns Newly created market
 */
export const createMarket = async (
  eventId: string,
  marketData: MarketData
): Promise<Market> => {
  // Check if event exists
  const event = await prisma.event.findUnique({
    where: { id: eventId }
  });

  if (!event) {
    throw new Error('Event not found');
  }

  // Create market
  const market = await prisma.market.create({
    data: {
      name: marketData.name,
      status: marketData.status || MarketStatus.OPEN,
      eventId
    }
  });

  return market;
};

/**
 * Get all markets
 * @param page Page number
 * @param limit Items per page
 * @param eventId Optional event ID to filter by
 * @param status Optional status to filter by
 * @param search Optional search term to filter by name
 * @returns List of markets with pagination info
 */
export const getAllMarkets = async (
  page: number = 1,
  limit: number = 10,
  eventId?: string,
  status?: string,
  search?: string
): Promise<{ markets: Market[]; total: number; page: number; pages: number }> => {
  // Calculate pagination
  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {};
  if (eventId) where.eventId = eventId;
  if (status) where.status = status;

  // Add search condition if provided
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      {
        event: {
          name: { contains: search, mode: 'insensitive' }
        }
      }
    ];
  }

  // Get total count
  const total = await prisma.market.count({
    where
  });

  // Get markets
  const markets = await prisma.market.findMany({
    where,
    include: {
      event: {
        include: {
          sport: true,
          participants: true
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
    markets,
    total,
    page,
    pages
  };
};

/**
 * Get markets by event ID
 * @param eventId Event ID
 * @param page Page number
 * @param limit Items per page
 * @returns List of markets with pagination info
 */
export const getMarketsByEvent = async (
  eventId: string,
  page: number = 1,
  limit: number = 10
): Promise<{ markets: Market[]; total: number; page: number; pages: number }> => {
  // Calculate pagination
  const skip = (page - 1) * limit;

  // Get total count
  const total = await prisma.market.count({
    where: { eventId }
  });

  // Get markets
  const markets = await prisma.market.findMany({
    where: { eventId },
    include: {
      event: {
        include: {
          sport: true
        }
      },
      bets: {
        select: {
          id: true,
          amount: true,
          odds: true,
          type: true,
          status: true,
          matchedAmount: true
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
    markets,
    total,
    page,
    pages
  };
};

/**
 * Get market by ID
 * @param marketId Market ID
 * @returns Market if found
 */
export const getMarketById = async (marketId: string): Promise<Market | null> => {
  return prisma.market.findUnique({
    where: { id: marketId },
    include: {
      event: {
        include: {
          sport: true,
          participants: true
        }
      },
      bets: {
        select: {
          id: true,
          amount: true,
          odds: true,
          selection: true,
          type: true,
          status: true,
          matchedAmount: true,
          user: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  });
};

/**
 * Update market status
 * @param marketId Market ID
 * @param status New status
 * @returns Updated market
 */
export const updateMarketStatus = async (
  marketId: string,
  status: MarketStatus
): Promise<Market> => {
  // Check if market exists
  const market = await prisma.market.findUnique({
    where: { id: marketId }
  });

  if (!market) {
    throw new Error('Market not found');
  }

  // Update market status
  return prisma.market.update({
    where: { id: marketId },
    data: { status }
  });
};

/**
 * Settle a market with a winning selection
 * @param marketId Market ID
 * @param winningSelection Winning selection
 * @returns Number of bets settled
 */
export const settleMarket = async (
  marketId: string,
  winningSelection: string
): Promise<number> => {
  // Check if market exists
  const market = await prisma.market.findUnique({
    where: { id: marketId },
    include: {
      event: true,
      bets: {
        include: {
          user: true,
          asBackBet: {
            include: {
              layBet: true
            }
          },
          asLayBet: {
            include: {
              backBet: true
            }
          }
        }
      }
    }
  });

  if (!market) {
    throw new Error('Market not found');
  }

  // Check if market is already settled
  if (market.status === MarketStatus.SETTLED) {
    throw new Error('Market is already settled');
  }

  // No longer requiring event to be completed
  // Markets can be settled independently of event status

  // Get all matched bets for this market
  const matchedBets = market.bets.filter(
    bet => bet.status === 'FULLY_MATCHED' || bet.status === 'PARTIALLY_MATCHED'
  );

  if (matchedBets.length === 0) {
    // Update market status to settled
    await prisma.market.update({
      where: { id: marketId },
      data: {
        status: MarketStatus.SETTLED,
        winningSelection: winningSelection,
        settledAt: new Date()
      }
    });
    return 0;
  }

  // Settle bets in a transaction with concurrency management
  let settledCount = 0;
  await concurrencyService.withRetry(async () => {
    return prisma.$transaction(async (tx) => {
    for (const bet of matchedBets) {
      // Determine bet result
      let result;
      let winnings = 0;

      if (bet.type === 'BACK') {
        // Back bet wins if selection matches winning selection
        if (bet.selection === winningSelection) {
          result = 'WON';
          winnings = bet.matchedAmount * bet.odds;
        } else {
          result = 'LOST';
        }
      } else {
        // Lay bet wins if selection doesn't match winning selection
        if (bet.selection !== winningSelection) {
          result = 'WON';
          winnings = bet.matchedAmount;
        } else {
          result = 'LOST';
        }
      }

      // Update bet status
      await tx.bet.update({
        where: { id: bet.id },
        data: {
          status: result === 'WON' ? 'WON' : 'LOST',
          settledAt: new Date()
        }
      });

      // Update user balance if bet won with optimistic locking
      if (result === 'WON') {
        try {
          // Verificar si el usuario existe antes de intentar actualizarlo
          const userExists = await tx.user.findUnique({
            where: { id: bet.userId }
          });

          if (userExists) {
            await tx.user.update({
              where: {
                id: bet.userId,
                version: bet.user.version // Asegurar que nadie más ha modificado el usuario
              },
              data: {
                balance: bet.user.balance + winnings,
                availableBalance: bet.user.availableBalance + winnings,
                version: { increment: 1 } // Incrementar la versión
              }
            });

            // Registrar la transacción de ganancias
            await tx.transaction.create({
              data: {
                userId: bet.userId,
                type: 'WINNING' as TransactionType,
                amount: winnings,
                status: 'COMPLETADA' as TransactionStatus,
                description: `Ganancias por apuesta ${bet.type} en ${bet.selection} a cuota ${bet.odds}`
              }
            });
          } else {
            console.warn(`Usuario con ID ${bet.userId} no encontrado al actualizar balance por apuesta ganada`);
          }
        } catch (error) {
          console.error(`Error al actualizar balance del usuario ${bet.userId} por apuesta ganada:`, error);
          // Continuar con la liquidación del mercado a pesar del error
        }
      }

      // Release reserved balance for lay bets
      if (bet.type === 'LAY' && bet.liability) {
        try {
          // Verificar si el usuario existe antes de intentar actualizarlo
          const userExists = await tx.user.findUnique({
            where: { id: bet.userId }
          });

          if (userExists) {
            await tx.user.update({
              where: {
                id: bet.userId,
                version: bet.user.version // Asegurar que nadie más ha modificado el usuario
              },
              data: {
                reservedBalance: bet.user.reservedBalance - bet.liability,
                version: { increment: 1 } // Incrementar la versión
              }
            });

            // Registrar la transacción de liberación de fondos
            await tx.transaction.create({
              data: {
                userId: bet.userId,
                type: 'RELEASE' as TransactionType,
                amount: bet.liability,
                status: 'COMPLETADA' as TransactionStatus,
                description: `Liberación de fondos reservados para apuesta LAY en ${bet.selection}`
              }
            });
          } else {
            console.warn(`Usuario con ID ${bet.userId} no encontrado al liberar fondos reservados para apuesta LAY`);
          }
        } catch (error) {
          console.error(`Error al liberar fondos reservados para apuesta LAY del usuario ${bet.userId}:`, error);
          // Continuar con la liquidación del mercado a pesar del error
        }
      }

      settledCount++;
    }

    // Update market status to settled with optimistic locking
    await tx.market.update({
      where: {
        id: marketId,
        version: market.version // Asegurar que nadie más ha modificado el mercado
      },
      data: {
        status: MarketStatus.SETTLED,
        winningSelection: winningSelection,
        settledAt: new Date(),
        version: { increment: 1 } // Incrementar la versión
      }
    });
    });
  }, 3); // Máximo 3 reintentos

  return settledCount;
};

/**
 * Get order book for a market
 * @param marketId Market ID
 * @returns Order book with back and lay bets
 */
export const getOrderBook = async (marketId: string): Promise<{
  selections: Record<string, {
    backBets: { odds: number, amount: number }[],
    layBets: { odds: number, amount: number }[]
  }>
}> => {
  // Check if market exists
  const market = await prisma.market.findUnique({
    where: { id: marketId },
    include: {
      event: {
        include: {
          participants: true
        }
      },
      bets: {
        where: {
          status: 'UNMATCHED'
        }
      }
    }
  });

  if (!market) {
    throw new Error('Market not found');
  }

  // Initialize order book
  const orderBook: Record<string, {
    backBets: { odds: number, amount: number }[],
    layBets: { odds: number, amount: number }[]
  }> = {};

  // Initialize selections from participants
  for (const participant of market.event.participants) {
    orderBook[participant.name] = {
      backBets: [],
      layBets: []
    };
  }

  // Group bets by selection and type
  for (const bet of market.bets) {
    if (!orderBook[bet.selection]) {
      orderBook[bet.selection] = {
        backBets: [],
        layBets: []
      };
    }

    const unmatchedAmount = bet.amount - bet.matchedAmount;
    if (unmatchedAmount <= 0) continue;

    if (bet.type === 'BACK') {
      // Add to back bets
      orderBook[bet.selection].backBets.push({
        odds: bet.odds,
        amount: unmatchedAmount
      });
    } else {
      // Add to lay bets
      orderBook[bet.selection].layBets.push({
        odds: bet.odds,
        amount: unmatchedAmount
      });
    }
  }

  // Aggregate and sort bets by odds
  for (const selection in orderBook) {
    // Aggregate back bets by odds (best odds first - highest)
    const backBetsMap = new Map<number, number>();
    for (const bet of orderBook[selection].backBets) {
      const currentAmount = backBetsMap.get(bet.odds) || 0;
      backBetsMap.set(bet.odds, currentAmount + bet.amount);
    }
    orderBook[selection].backBets = Array.from(backBetsMap.entries())
      .map(([odds, amount]) => ({ odds, amount }))
      .sort((a, b) => b.odds - a.odds);

    // Aggregate lay bets by odds (best odds first - lowest)
    const layBetsMap = new Map<number, number>();
    for (const bet of orderBook[selection].layBets) {
      const currentAmount = layBetsMap.get(bet.odds) || 0;
      layBetsMap.set(bet.odds, currentAmount + bet.amount);
    }
    orderBook[selection].layBets = Array.from(layBetsMap.entries())
      .map(([odds, amount]) => ({ odds, amount }))
      .sort((a, b) => a.odds - b.odds);
  }

  return { selections: orderBook };
};
