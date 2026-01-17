// ============================================
// CACHE REPOSITORY LAYER
// ============================================
// Database operations for cached ETF data
// Handles CRUD operations for all cache types

import { prisma } from '@/lib/db/prisma';
import { CACHE_CONFIG } from '../config';

/**
 * Check if a cache entry has expired
 */
export function isExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

/**
 * Check if a cache entry is stale (within 5 min of expiry)
 */
export function isStale(expiresAt: Date): boolean {
  const now = new Date();
  const timeUntilExpiry = expiresAt.getTime() - now.getTime();
  return timeUntilExpiry < 5 * 60 * 1000; // 5 minutes
}

// ============================================
// QUOTE CACHE
// ============================================

export const quoteCache = {
  /**
   * Get cached quote for a symbol
   */
  async get(symbol: string) {
    return await prisma.cachedQuote.findUnique({
      where: { symbol: symbol.toUpperCase() }
    });
  },

  /**
   * Set or update cached quote
   */
  async set(symbol: string, data: {
    bid: number;
    ask: number;
    midpoint: number;
    previousClose?: number;
    change?: number;
    changePercent?: number;
  }, ttlMs: number = CACHE_CONFIG.TTL_MS) {
    const expiresAt = new Date(Date.now() + ttlMs);

    return await prisma.cachedQuote.upsert({
      where: { symbol: symbol.toUpperCase() },
      update: {
        ...data,
        expiresAt
      },
      create: {
        symbol: symbol.toUpperCase(),
        ...data,
        expiresAt
      }
    });
  },

  /**
   * Get all cached quotes (for batch operations)
   */
  async getAll() {
    return await prisma.cachedQuote.findMany({
      where: {
        expiresAt: { gt: new Date() }
      }
    });
  },

  /**
   * Delete expired quotes
   */
  async deleteExpired() {
    return await prisma.cachedQuote.deleteMany({
      where: {
        expiresAt: { lte: new Date() }
      }
    });
  }
};

// ============================================
// HISTORICAL DATA CACHE
// ============================================

export const historicalCache = {
  /**
   * Get cached historical data for a symbol
   */
  async get(symbol: string, timespan: string = 'day') {
    // Get the most recent historical data entry for this symbol
    return await prisma.cachedHistoricalData.findFirst({
      where: {
        symbol: symbol.toUpperCase(),
        timespan,
      },
      orderBy: { startDate: 'desc' }
    });
  },

  /**
   * Set or update cached historical data
   * @param isFirstFetch - true for initial full historical load, false for incremental updates
   */
  async set(symbol: string, timespan: string, data: any[], startDate: Date, endDate: Date, isFirstFetch: boolean = false, ttlMs: number = CACHE_CONFIG.TTL_MS) {
    const expiresAt = new Date(Date.now() + ttlMs);

    // For first fetch, we store the full dataset
    // For incremental updates, we append to existing data
    if (isFirstFetch) {
      // Delete any existing data for this symbol/timespan
      await prisma.cachedHistoricalData.deleteMany({
        where: { symbol: symbol.toUpperCase(), timespan }
      });

      return await prisma.cachedHistoricalData.create({
        data: {
          symbol: symbol.toUpperCase(),
          timespan,
          data,
          startDate,
          endDate,
          expiresAt
        }
      });
    } else {
      // Incremental update: append new data to existing
      const existing = await this.get(symbol, timespan);
      if (existing) {
        // Merge existing data with new data
        const existingData = Array.isArray(existing.data) ? existing.data : [];
        const mergedData = [...existingData, ...data];

        return await prisma.cachedHistoricalData.update({
          where: { id: existing.id },
          data: {
            data: mergedData,
            endDate,
            expiresAt
          }
        });
      } else {
        // No existing data, create new entry
        return await prisma.cachedHistoricalData.create({
          data: {
            symbol: symbol.toUpperCase(),
            timespan,
            data,
            startDate,
            endDate,
            expiresAt
          }
        });
      }
    }
  },

  /**
   * Check if historical data exists for a symbol
   */
  async exists(symbol: string, timespan: string = 'day'): Promise<boolean> {
    const cached = await this.get(symbol, timespan);
    return cached !== null && !isExpired(cached.expiresAt);
  },

  /**
   * Delete expired historical data
   */
  async deleteExpired() {
    return await prisma.cachedHistoricalData.deleteMany({
      where: {
        expiresAt: { lte: new Date() }
      }
    });
  }
};

// ============================================
// TOP PICKS CACHE
// ============================================

export const topPicksCache = {
  /**
   * Get cached top picks
   */
  async get() {
    return await prisma.cachedTopPicks.findFirst({
      orderBy: { fetchedAt: 'desc' }
    });
  },

  /**
   * Set cached top picks
   */
  async set(data: any[], ttlMs: number = CACHE_CONFIG.TTL_MS) {
    const expiresAt = new Date(Date.now() + ttlMs);

    // Delete old entries to keep only the latest
    await prisma.cachedTopPicks.deleteMany({});

    return await prisma.cachedTopPicks.create({
      data: {
        data,
        expiresAt
      }
    });
  },

  /**
   * Check if top picks cache exists and is valid
   */
  async exists(): Promise<boolean> {
    const cached = await this.get();
    return cached !== null && !isExpired(cached.expiresAt);
  }
};

// ============================================
// PORTFOLIO DATA CACHE
// ============================================

export const portfolioCache = {
  /**
   * Get cached portfolio data
   */
  async get(symbols: string[]) {
    const symbolsKey = symbols.sort().join(',');
    return await prisma.cachedPortfolioData.findUnique({
      where: { symbols: symbolsKey }
    });
  },

  /**
   * Set cached portfolio data
   */
  async set(symbols: string[], data: any, ttlMs: number = CACHE_CONFIG.TTL_MS) {
    const symbolsKey = symbols.sort().join(',');
    const expiresAt = new Date(Date.now() + ttlMs);

    return await prisma.cachedPortfolioData.upsert({
      where: { symbols: symbolsKey },
      update: { data, expiresAt },
      create: {
        symbols: symbolsKey,
        data,
        expiresAt
      }
    });
  }
};

// ============================================
// MAINTENANCE
// ============================================

/**
 * Clean up all expired cache entries
 */
export async function cleanupExpiredCache() {
  await quoteCache.deleteExpired();
  await historicalCache.deleteExpired();

  // Also delete expired top picks
  await prisma.cachedTopPicks.deleteMany({
    where: { expiresAt: { lte: new Date() } }
  });

  await prisma.cachedPortfolioData.deleteMany({
    where: { expiresAt: { lte: new Date() } }
  });
}

/**
 * Get cache statistics
 */
export async function getCacheStats() {
  const [quoteCount, historicalCount, topPicksCount] = await Promise.all([
    prisma.cachedQuote.count(),
    prisma.cachedHistoricalData.count(),
    prisma.cachedTopPicks.count()
  ]);

  return {
    quotes: quoteCount,
    historical: historicalCount,
    topPicks: topPicksCount
  };
}
