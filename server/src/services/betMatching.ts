import { Bet, BetMatch, BetStatus, BetType } from '@prisma/client';
import prisma from '../config/prisma';

/**
 * Try to match a bet with existing bets
 * @param betId Bet ID to match
 * @returns Matching result with matched amount and matches
 */
export const matchBet = async (
  betId: string
): Promise<{ matchedAmount: number; matches: BetMatch[] }> => {
  // Get the bet to match
  const bet = await prisma.bet.findUnique({
    where: { id: betId }
  });

  if (!bet) {
    throw new Error('Bet not found');
  }

  // Only match unmatched or partially matched bets
  if (bet.status !== BetStatus.UNMATCHED && bet.status !== BetStatus.PARTIALLY_MATCHED) {
    throw new Error('Bet is not available for matching');
  }

  // Find matching bets
  const matchingBets = await findMatchingBets(bet);

  if (matchingBets.length === 0) {
    return { matchedAmount: 0, matches: [] };
  }

  // Match the bet with available matching bets
  const matches: BetMatch[] = [];
  let remainingAmount = bet.amount - bet.matchedAmount;

  // Process in a transaction
  await prisma.$transaction(async (tx) => {
    for (const matchingBet of matchingBets) {
      if (remainingAmount <= 0) break;

      // Calculate the amount to match
      const matchingBetAvailable = matchingBet.amount - matchingBet.matchedAmount;
      const matchAmount = Math.min(remainingAmount, matchingBetAvailable);

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
          odds: bet.odds, // Use the odds from the current bet
          backBetId,
          layBetId
        }
      });

      matches.push(match);

      // Update the current bet
      await tx.bet.update({
        where: { id: bet.id },
        data: {
          matchedAmount: bet.matchedAmount + matchAmount,
          status: bet.matchedAmount + matchAmount >= bet.amount
            ? BetStatus.FULLY_MATCHED
            : BetStatus.PARTIALLY_MATCHED
        }
      });

      // Update the matching bet
      await tx.bet.update({
        where: { id: matchingBet.id },
        data: {
          matchedAmount: matchingBet.matchedAmount + matchAmount,
          status: matchingBet.matchedAmount + matchAmount >= matchingBet.amount
            ? BetStatus.FULLY_MATCHED
            : BetStatus.PARTIALLY_MATCHED
        }
      });

      remainingAmount -= matchAmount;
    }
  });

  return {
    matchedAmount: bet.amount - remainingAmount - bet.matchedAmount,
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
    orderBy: bet.type === BetType.BACK
      ? { odds: 'asc' } // For back bets, prioritize lay bets with lowest odds
      : { odds: 'desc' } // For lay bets, prioritize back bets with highest odds
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
  // Get the bets
  const backBet = await prisma.bet.findUnique({
    where: { id: backBetId }
  });

  const layBet = await prisma.bet.findUnique({
    where: { id: layBetId }
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

  // Check available amounts
  const backBetAvailable = backBet.amount - backBet.matchedAmount;
  const layBetAvailable = layBet.amount - layBet.matchedAmount;

  if (backBetAvailable < amount || layBetAvailable < amount) {
    throw new Error('Insufficient available amount for matching');
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
    await tx.bet.update({
      where: { id: backBetId },
      data: {
        matchedAmount: backBet.matchedAmount + amount,
        status: backBet.matchedAmount + amount >= backBet.amount
          ? BetStatus.FULLY_MATCHED
          : BetStatus.PARTIALLY_MATCHED
      }
    });

    // Update the lay bet
    await tx.bet.update({
      where: { id: layBetId },
      data: {
        matchedAmount: layBet.matchedAmount + amount,
        status: layBet.matchedAmount + amount >= layBet.amount
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
 * @returns List of matches
 */
export const getBetMatches = async (betId: string): Promise<BetMatch[]> => {
  // Get the bet
  const bet = await prisma.bet.findUnique({
    where: { id: betId }
  });

  if (!bet) {
    throw new Error('Bet not found');
  }

  // Get matches based on bet type
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
            }
          }
        }
      }
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
            }
          }
        }
      }
    });
  }
};
