// ============================================
// CACHE CONFIGURATION
// ============================================
// Hybrid caching system for ETF market data
// - Top 50 ETFs: Real-time updates every 30 min during market hours
// - All 200 ETFs: Daily updates and on-demand fetching
// Fetches from Polygon.io and stores locally

import { TOP_50, ALL_200_ETFS } from '../etf-symbols';

/**
 * Cache configuration constants
 */
export const CACHE_CONFIG = {
  // Time-to-live for cached data
  TTL_MS: 35 * 60 * 1000, // 35 minutes (30 min fetch + 5 min grace)
  DAILY_TTL_MS: 25 * 60 * 60 * 1000, // 25 hours for daily data

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

  // ETF tiers
  TRACKED_SYMBOLS: TOP_50, // Backward compatibility - uses top 50
  TOP_50_SYMBOLS: TOP_50,
  ALL_200_SYMBOLS: ALL_200_ETFS,

  // Rate limiting to stay within Polygon free tier (5 requests/minute)
  RATE_LIMIT_DELAY_MS: 12000, // 12 seconds between each symbol (5 req/min)

  // Batch sizes for processing
  TOP_50_BATCH_SIZE: 10,     // Process 10 at a time for real-time
  ALL_200_BATCH_SIZE: 10,    // Process 10 at a time for daily

  // Historical data settings
  HISTORICAL_DAYS_REALTIME: 30,    // 30 days for top 50 (fast access)
  HISTORICAL_DAYS_DAILY: 90,       // 90 days for all 200 (comprehensive)
  HISTORICAL_DAYS_FIRST_FETCH: 90, // Backward compatibility - same as DAILY
  HISTORICAL_DAYS_INCREMENTAL: 1,  // 1 day for incremental updates
} as const;

/**
 * Cache entry types
 */
export type CacheEntryType = 'quote' | 'historical' | 'topPicks' | 'portfolio';

/**
 * Cache status
 */
export type CacheStatus = 'fresh' | 'stale' | 'expired' | 'missing';
