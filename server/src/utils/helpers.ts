/**
 * Helper functions for the application
 */

/**
 * Generate a random string of specified length
 * @param length Length of the string
 * @returns Random string
 */
export const generateRandomString = (length: number): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
};

/**
 * Format currency amount
 * @param amount Amount to format
 * @param currency Currency code
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};

/**
 * Calculate potential winnings from a bet
 * @param amount Bet amount
 * @param odds Bet odds
 * @returns Potential winnings
 */
export const calculatePotentialWinnings = (amount: number, odds: number): number => {
  return amount * odds;
};
