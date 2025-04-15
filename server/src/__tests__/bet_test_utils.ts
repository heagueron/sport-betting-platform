import { Bet, BetType, BetStatus } from '@prisma/client';
import prisma from '../config/prisma';
import { BetData } from '../types';

// Log the creation of a bet for debugging
const logBetCreation = (bet: Bet, type: string) => {
  console.log(`Created ${type} bet:`, {
    id: bet.id,
    userId: bet.userId,
    selection: bet.selection,
    amount: bet.amount,
    odds: bet.odds,
    type: bet.type
  });
};

/**
 * Create a back bet for testing
 * @param userId User ID
 * @param betData Bet data
 * @returns Created bet
 */
export const createTestBackBet = async (
  userId: string,
  betData: BetData
): Promise<Bet> => {
  // Calculate potential winnings
  const potentialWinnings = betData.amount * betData.odds;

  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error(`User not found with ID: ${userId}`);
  }

  // Create bet directly
  const bet = await prisma.bet.create({
    data: {
      amount: betData.amount,
      odds: betData.odds,
      selection: betData.selection,
      potentialWinnings,
      type: BetType.BACK,
      matchedAmount: 0,
      userId,
      eventId: betData.eventId,
      marketId: betData.marketId,
      status: BetStatus.UNMATCHED
    }
  });

  logBetCreation(bet, 'back');
  return bet;
};

/**
 * Create a lay bet for testing
 * @param userId User ID
 * @param betData Bet data
 * @returns Created bet
 */
export const createTestLayBet = async (
  userId: string,
  betData: BetData
): Promise<Bet> => {
  // Calculate liability
  const liability = betData.amount * (betData.odds - 1);

  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error(`User not found with ID: ${userId}`);
  }

  // Create bet directly
  const bet = await prisma.bet.create({
    data: {
      amount: betData.amount,
      odds: betData.odds,
      selection: betData.selection,
      potentialWinnings: betData.amount,
      liability,
      type: BetType.LAY,
      matchedAmount: 0,
      userId,
      eventId: betData.eventId,
      marketId: betData.marketId,
      status: BetStatus.UNMATCHED
    }
  });

  logBetCreation(bet, 'lay');
  return bet;
};
