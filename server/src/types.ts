import { MarketStatus } from '@prisma/client';

/**
 * Data for creating a bet
 */
export interface BetData {
  eventId: string;
  marketId: string;
  amount: number;
  odds: number;
  selection: string;
}

/**
 * Data for creating a market
 */
export interface MarketData {
  name: string;
  status?: MarketStatus;
}

/**
 * Order book entry
 */
export interface OrderBookEntry {
  odds: number;
  amount: number;
}

/**
 * Order book for a selection
 */
export interface SelectionOrderBook {
  backBets: OrderBookEntry[];
  layBets: OrderBookEntry[];
}

/**
 * Order book for a market
 */
export interface OrderBook {
  selections: Record<string, SelectionOrderBook>;
}

/**
 * User balance information
 */
export interface UserBalance {
  balance: number;
  availableBalance: number;
  reservedBalance: number;
}
