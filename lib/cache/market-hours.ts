// ============================================
// MARKET HOURS VALIDATOR
// ============================================
// Determines if US stock market is open for trading
// Uses Eastern Time (America/New_York) for NYSE hours

import { CACHE_CONFIG } from './config';

/**
 * Get current time in Eastern Timezone
 */
function getEasternTime(): Date {
  const now = new Date();
  // Use Intl API to get Eastern Time
  const easternTime = new Date(
    now.toLocaleString('en-US', { timeZone: CACHE_CONFIG.TIMEZONE })
  );
  return easternTime;
}

/**
 * Format date as YYYY-MM-DD in Eastern Time
 */
function getEasternDateString(date: Date): string {
  const eastern = new Date(
    date.toLocaleString('en-US', { timeZone: CACHE_CONFIG.TIMEZONE })
  );
  const year = eastern.getFullYear();
  const month = String(eastern.getMonth() + 1).padStart(2, '0');
  const day = String(eastern.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if today is a weekend (Saturday or Sunday)
 */
function isWeekend(date: Date): boolean {
  const eastern = getEasternTime();
  const day = eastern.getDay(); // 0 = Sunday, 6 = Saturday
  return day === 0 || day === 6;
}

/**
 * Check if today is a US market holiday
 */
function isHoliday(date: Date): boolean {
  const dateStr = getEasternDateString(date);
  return CACHE_CONFIG.HOLIDAYS.includes(dateStr);
}

/**
 * Check if current time is within market hours (8 AM - 6 PM ET)
 */
function isWithinMarketHours(date: Date): boolean {
  const eastern = getEasternTime();
  const hour = eastern.getHours();
  return hour >= CACHE_CONFIG.MARKET_OPEN_HOUR && hour < CACHE_CONFIG.MARKET_CLOSE_HOUR;
}

/**
 * Main function: Check if US stock market is currently open
 * @returns true if market is open (weekday, not holiday, within hours)
 */
export function isMarketOpen(): boolean {
  // Check weekend
  if (isWeekend(new Date())) {
    return false;
  }

  // Check holiday
  if (isHoliday(new Date())) {
    return false;
  }

  // Check hours
  return isWithinMarketHours(new Date());
}

/**
 * Get the next time the market will open
 * Useful for scheduling cache warmers
 */
export function getNextMarketOpen(): Date {
  const now = new Date();
  const eastern = getEasternTime();

  // Start from tomorrow
  let nextOpen = new Date(eastern);
  nextOpen.setDate(nextOpen.getDate() + 1);
  nextOpen.setHours(CACHE_CONFIG.MARKET_OPEN_HOUR, 0, 0, 0);

  // Keep adding days until we find a trading day
  let attempts = 0;
  while (attempts < 7) { // Check up to 7 days ahead
    const dayOfWeek = nextOpen.getDay();
    const dateStr = getEasternDateString(nextOpen);

    // Skip weekends
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Skip holidays
      if (!CACHE_CONFIG.HOLIDAYS.includes(dateStr)) {
        return nextOpen;
      }
    }

    nextOpen.setDate(nextOpen.getDate() + 1);
    attempts++;
  }

  // Fallback: return a week from now
  const fallback = new Date();
  fallback.setDate(fallback.getDate() + 7);
  return fallback;
}

/**
 * Get the next time the market will close
 */
export function getNextMarketClose(): Date {
  const eastern = getEasternTime();
  const hour = eastern.getHours();

  const closeTime = new Date(eastern);
  closeTime.setHours(CACHE_CONFIG.MARKET_CLOSE_HOUR, 0, 0, 0);

  // If market is already closed today, next close is tomorrow
  if (hour >= CACHE_CONFIG.MARKET_CLOSE_HOUR) {
    closeTime.setDate(closeTime.getDate() + 1);
  }

  return closeTime;
}

/**
 * Get a human-readable market status message
 */
export function getMarketStatusMessage(): string {
  if (isMarketOpen()) {
    return 'Market is open';
  }

  const nextOpen = getNextMarketOpen();
  const now = getEasternTime();
  const hoursUntilOpen = Math.floor((nextOpen.getTime() - now.getTime()) / (1000 * 60 * 60));

  if (hoursUntilOpen < 24) {
    return `Market closed, opens in ${hoursUntilOpen}h`;
  }

  const daysUntilOpen = Math.ceil(hoursUntilOpen / 24);
  return `Market closed, opens in ${daysUntilOpen}d`;
}
