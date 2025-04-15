import { Bet, BetMatch, BetStatus, BetType } from '@prisma/client';
import prisma from '../config/prisma';

/**
 * Calculate the liability for a lay bet
 * @param amount Bet amount
 * @param odds Bet odds
 * @returns Liability amount (maximum potential loss)
 */
export const calculateLayBetLiability = (amount: number, odds: number): number => {
  // Liability = (odds - 1) * amount
  return (odds - 1) * amount;
};

/**
 * Calculate potential profit for a bet
 * @param bet Bet object
 * @returns Potential profit amount
 */
export const calculatePotentialProfit = (bet: Bet): number => {
  if (bet.type === BetType.BACK) {
    // For back bets: potential profit = amount * (odds - 1)
    return bet.amount * (bet.odds - 1);
  } else {
    // For lay bets: potential profit = amount
    return bet.amount;
  }
};

/**
 * Calculate potential loss for a bet
 * @param bet Bet object
 * @returns Potential loss amount
 */
export const calculatePotentialLoss = (bet: Bet): number => {
  if (bet.type === BetType.BACK) {
    // For back bets: potential loss = amount
    return bet.amount;
  } else {
    // For lay bets: potential loss = liability = amount * (odds - 1)
    return calculateLayBetLiability(bet.amount, bet.odds);
  }
};

/**
 * Try to match a bet with existing bets
 * @param betId Bet ID to match
 * @returns Matching result with matched amount and matches
 */
export const matchBet = async (
  betId: string
): Promise<{ matchedAmount: number; matches: BetMatch[] }> => {
  // Get the bet to match with user information
  const bet = await prisma.bet.findUnique({
    where: { id: betId },
    include: {
      user: true,
      market: true
    }
  });

  if (!bet) {
    throw new Error('Bet not found');
  }

  // Only match unmatched or partially matched bets
  if (bet.status !== BetStatus.UNMATCHED && bet.status !== BetStatus.PARTIALLY_MATCHED) {
    throw new Error('Bet is not available for matching');
  }

  // Check if market is still open
  if (bet.market.status !== 'OPEN') {
    throw new Error('Market is not open for matching');
  }

  // Find matching bets
  const matchingBets = await findMatchingBets(bet);

  if (matchingBets.length === 0) {
    return { matchedAmount: 0, matches: [] };
  }

  // Match the bet with available matching bets
  const matches: BetMatch[] = [];
  let remainingAmount = bet.amount - bet.matchedAmount;
  let totalMatchedAmount = 0;

  // Process in a transaction
  await prisma.$transaction(async (tx) => {
    for (const matchingBet of matchingBets) {
      if (remainingAmount <= 0) break;

      // Calculate the amount to match
      const matchingBetAvailable = matchingBet.amount - matchingBet.matchedAmount;
      const matchAmount = Math.min(remainingAmount, matchingBetAvailable);

      // Skip if match amount is too small
      if (matchAmount <= 0) continue;

      // Determine which odds to use - always use the best odds for the match
      // For back bets, use the lower of the two odds
      // For lay bets, use the higher of the two odds
      let matchOdds;
      if (bet.type === BetType.BACK) {
        // When matching a back bet with a lay bet, use the lay bet odds if they're lower
        matchOdds = Math.min(bet.odds, matchingBet.odds);
      } else {
        // When matching a lay bet with a back bet, use the back bet odds if they're higher
        matchOdds = Math.max(bet.odds, matchingBet.odds);
      }

      // Create the match
      let backBetId, layBetId;
      if (bet.type === BetType.BACK) {
        backBetId = bet.id;
        layBetId = matchingBet.id;
      } else {
        backBetId = matchingBet.id;
        layBetId = bet.id;
      }

      const match = await tx.betMatch.create({
        data: {
          amount: matchAmount,
          odds: matchOdds,
          backBetId,
          layBetId
        }
      });

      matches.push(match);
      totalMatchedAmount += matchAmount;

      // Update the current bet
      const newBetMatchedAmount = bet.matchedAmount + matchAmount;
      await tx.bet.update({
        where: { id: bet.id },
        data: {
          matchedAmount: newBetMatchedAmount,
          status: newBetMatchedAmount >= bet.amount
            ? BetStatus.FULLY_MATCHED
            : BetStatus.PARTIALLY_MATCHED
        }
      });

      // Update the matching bet
      const newMatchingBetMatchedAmount = matchingBet.matchedAmount + matchAmount;
      await tx.bet.update({
        where: { id: matchingBet.id },
        data: {
          matchedAmount: newMatchingBetMatchedAmount,
          status: newMatchingBetMatchedAmount >= matchingBet.amount
            ? BetStatus.FULLY_MATCHED
            : BetStatus.PARTIALLY_MATCHED
        }
      });

      remainingAmount -= matchAmount;
    }
  });

  return {
    matchedAmount: totalMatchedAmount,
    matches
  };
};

/**
 * Find bets that can be matched with the given bet
 * @param bet Bet to match
 * @returns List of matching bets
 */
export const findMatchingBets = async (bet: Bet): Promise<Bet[]> => {
  // Find bets of the opposite type with the same selection and market
  const oppositeType = bet.type === BetType.BACK ? BetType.LAY : BetType.BACK;

  // For back bets, find lay bets with the same or lower odds
  // For lay bets, find back bets with the same or higher odds
  const oddsCondition = bet.type === BetType.BACK
    ? { lte: bet.odds } // For back bets, find lay bets with odds <= back odds
    : { gte: bet.odds }; // For lay bets, find back bets with odds >= lay odds

  // Find matching bets
  const matchingBets = await prisma.bet.findMany({
    where: {
      type: oppositeType,
      selection: bet.selection,
      marketId: bet.marketId,
      status: {
        in: [BetStatus.UNMATCHED, BetStatus.PARTIALLY_MATCHED]
      },
      odds: oddsCondition,
      // Don't match with bets from the same user
      userId: { not: bet.userId }
    },
    orderBy: [
      // First priority: best odds
      bet.type === BetType.BACK
        ? { odds: 'asc' } // For back bets, prioritize lay bets with lowest odds
        : { odds: 'desc' }, // For lay bets, prioritize back bets with highest odds
      // Second priority: oldest first (FIFO)
      { createdAt: 'asc' }
    ]
  });

  return matchingBets;
};

/**
 * Create a match between two bets
 * @param backBetId Back bet ID
 * @param layBetId Lay bet ID
 * @param amount Amount to match
 * @param odds Odds for the match
 * @returns Created match
 */
export const createBetMatch = async (
  backBetId: string,
  layBetId: string,
  amount: number,
  odds: number
): Promise<BetMatch> => {
  // Get the bets with market information
  const backBet = await prisma.bet.findUnique({
    where: { id: backBetId },
    include: { market: true }
  });

  const layBet = await prisma.bet.findUnique({
    where: { id: layBetId },
    include: { market: true }
  });

  if (!backBet || !layBet) {
    throw new Error('One or both bets not found');
  }

  if (backBet.type !== BetType.BACK || layBet.type !== BetType.LAY) {
    throw new Error('Invalid bet types for matching');
  }

  // Check if bets can be matched
  if (backBet.selection !== layBet.selection) {
    throw new Error('Bets have different selections');
  }

  if (backBet.marketId !== layBet.marketId) {
    throw new Error('Bets are for different markets');
  }

  // Check if market is still open
  if (backBet.market.status !== 'OPEN' || layBet.market.status !== 'OPEN') {
    throw new Error('Market is not open for matching');
  }

  // Check if odds are compatible
  if (backBet.odds < layBet.odds) {
    throw new Error('Incompatible odds: back bet odds must be >= lay bet odds');
  }

  // Check available amounts
  const backBetAvailable = backBet.amount - backBet.matchedAmount;
  const layBetAvailable = layBet.amount - layBet.matchedAmount;

  if (backBetAvailable < amount || layBetAvailable < amount) {
    throw new Error('Insufficient available amount for matching');
  }

  // Validate amount is positive
  if (amount <= 0) {
    throw new Error('Match amount must be positive');
  }

  // Create the match in a transaction
  return prisma.$transaction(async (tx) => {
    // Create the match
    const match = await tx.betMatch.create({
      data: {
        amount,
        odds,
        backBetId,
        layBetId
      }
    });

    // Update the back bet
    const newBackBetMatchedAmount = backBet.matchedAmount + amount;
    await tx.bet.update({
      where: { id: backBetId },
      data: {
        matchedAmount: newBackBetMatchedAmount,
        status: newBackBetMatchedAmount >= backBet.amount
          ? BetStatus.FULLY_MATCHED
          : BetStatus.PARTIALLY_MATCHED
      }
    });

    // Update the lay bet
    const newLayBetMatchedAmount = layBet.matchedAmount + amount;
    await tx.bet.update({
      where: { id: layBetId },
      data: {
        matchedAmount: newLayBetMatchedAmount,
        status: newLayBetMatchedAmount >= layBet.amount
          ? BetStatus.FULLY_MATCHED
          : BetStatus.PARTIALLY_MATCHED
      }
    });

    return match;
  });
};

/**
 * Get matches for a bet
 * @param betId Bet ID
 * @returns List of matches with detailed information
 */
export const getBetMatches = async (betId: string): Promise<BetMatch[]> => {
  // Get the bet with market information
  const bet = await prisma.bet.findUnique({
    where: { id: betId },
    include: {
      market: true,
      event: true
    }
  });

  if (!bet) {
    throw new Error('Bet not found');
  }

  // Get matches based on bet type with detailed information
  if (bet.type === BetType.BACK) {
    return prisma.betMatch.findMany({
      where: { backBetId: betId },
      include: {
        layBet: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            },
            market: true
          }
        },
        backBet: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            },
            market: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  } else {
    return prisma.betMatch.findMany({
      where: { layBetId: betId },
      include: {
        backBet: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            },
            market: true
          }
        },
        layBet: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            },
            market: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
};

/**
 * Get unmatched bets for a market (order book)
 * @param marketId Market ID
 * @param selection Optional selection to filter by
 * @returns Object with back and lay bets grouped by odds
 */
export const getMarketOrderBook = async (
  marketId: string,
  selection?: string
): Promise<{
  backBets: { odds: number; totalAmount: number; bets: Bet[] }[];
  layBets: { odds: number; totalAmount: number; bets: Bet[] }[];
}> => {
  // Build the where condition
  const whereCondition: any = {
    marketId,
    status: {
      in: [BetStatus.UNMATCHED, BetStatus.PARTIALLY_MATCHED]
    }
  };

  // Add selection filter if provided
  if (selection) {
    whereCondition.selection = selection;
  }

  // Get all unmatched or partially matched bets for the market
  const bets = await prisma.bet.findMany({
    where: whereCondition,
    include: {
      user: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: [
      { createdAt: 'asc' }
    ]
  });

  // Separate back and lay bets
  const backBets = bets.filter(bet => bet.type === BetType.BACK);
  const layBets = bets.filter(bet => bet.type === BetType.LAY);

  // Group back bets by odds and calculate total amount
  const backBetsByOdds = backBets.reduce<Record<number, Bet[]>>((acc, bet) => {
    const odds = bet.odds;
    if (!acc[odds]) {
      acc[odds] = [];
    }
    acc[odds].push(bet);
    return acc;
  }, {});

  // Group lay bets by odds and calculate total amount
  const layBetsByOdds = layBets.reduce<Record<number, Bet[]>>((acc, bet) => {
    const odds = bet.odds;
    if (!acc[odds]) {
      acc[odds] = [];
    }
    acc[odds].push(bet);
    return acc;
  }, {});

  // Format back bets for response
  const formattedBackBets = Object.entries(backBetsByOdds).map(([oddsStr, bets]) => {
    const odds = parseFloat(oddsStr);
    const totalAmount = bets.reduce((sum, bet) => sum + (bet.amount - bet.matchedAmount), 0);
    return { odds, totalAmount, bets };
  }).sort((a, b) => b.odds - a.odds); // Sort by odds descending

  // Format lay bets for response
  const formattedLayBets = Object.entries(layBetsByOdds).map(([oddsStr, bets]) => {
    const odds = parseFloat(oddsStr);
    const totalAmount = bets.reduce((sum, bet) => sum + (bet.amount - bet.matchedAmount), 0);
    return { odds, totalAmount, bets };
  }).sort((a, b) => a.odds - b.odds); // Sort by odds ascending

  return {
    backBets: formattedBackBets,
    layBets: formattedLayBets
  };
};
