// ============================================
// CACHE CONFIGURATION
// ============================================
// 30-minute caching system for ETF market data
// Fetches from Polygon.io every 30 minutes during market hours
// Stores data locally and serves all dashboard requests from cache

/**
 * Cache configuration constants
 */
export const CACHE_CONFIG = {
  // Time-to-live for cached data (35 minutes = 30 min fetch + 5 min grace)
  TTL_MS: 35 * 60 * 1000,

  // Market hours (Eastern Time - NYSE)
  MARKET_OPEN_HOUR: 8,   // 8 AM ET
  MARKET_CLOSE_HOUR: 18,  // 6 PM ET
  TIMEZONE: 'America/New_York',

  // US Market Holidays 2025 (NYSE)
  HOLIDAYS: [
    '2025-01-01', // New Year's Day
    '2025-01-20', // Martin Luther King Jr. Day
    '2025-02-17', // Presidents Day
    '2025-04-18', // Good Friday
    '2025-05-26', // Memorial Day
    '2025-07-04', // Independence Day
    '2025-09-01', // Labor Day
    '2025-11-27', // Thanksgiving Day
    '2025-11-28', // Black Friday (NYSE closed)
    '2025-12-25', // Christmas Day
  ] as string[],

  // ETFs to track and cache
  TRACKED_SYMBOLS: [
    'VOO',   // Vanguard S&P 500
    'QQQ',   // Invesco QQQ Trust
    'SCHD',  // Schwab US Dividend Equity
    'VTI',   // Vanguard Total Stock Market
    'VGT',   // Vanguard Information Technology
    'XLK',   // Technology Select Sector SPDR
    'XLF',   // Financial Select Sector SPDR
    'JEPQ',  // JPMorgan Nasdaq Equity Premium Income
  ],

  // Rate limiting to stay within Polygon free tier (5 requests/minute)
  RATE_LIMIT_DELAY_MS: 12000, // 12 seconds between each symbol

  // Historical data settings
  HISTORICAL_DAYS_FIRST_FETCH: 90, // 90 days for first fetch (reduced to avoid Vercel timeout)
  HISTORICAL_DAYS_INCREMENTAL: 1, // 1 day for incremental updates
} as const;

/**
 * Cache entry types
 */
export type CacheEntryType = 'quote' | 'historical' | 'topPicks' | 'portfolio';

/**
 * Cache status
 */
export type CacheStatus = 'fresh' | 'stale' | 'expired' | 'missing';
