// ============================================
// HISTORICAL DATA ENDPOINT (All 200 ETFs)
// ============================================
// Fetches historical data for all 200 ETFs
// Runs overnight (2 AM ET) to avoid market hours
// Fetches 90 days of data per ETF
// Rate limited to 5 requests/minute (Polygon free tier)

import { NextRequest, NextResponse } from 'next/server';
import { getPolygonClient } from '@/lib/api/polygon';
import { historicalCache } from '@/lib/cache/repositories/cache.repository';
import { CACHE_CONFIG } from '@/lib/cache/config';
import { prisma } from '@/lib/db/prisma';

/**
 * Delay helper for rate limiting
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if this is the first time fetching historical data for a symbol
 */
async function isFirstFetch(symbol: string): Promise<boolean> {
  const cached = await historicalCache.get(symbol, 'day');
  return !cached; // If no cached data exists, it's the first fetch
}

/**
 * Fetch historical data for a single symbol
 */
async function fetchHistorical(symbol: string, isFirstFetch: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const polygon = getPolygonClient();

    // For first fetch, get 90 days
    // For incremental updates, get 1 day
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(
      startDate.getDate() - (isFirstFetch ? CACHE_CONFIG.HISTORICAL_DAYS_DAILY : CACHE_CONFIG.HISTORICAL_DAYS_INCREMENTAL)
    );

    const aggregates = await polygon.getAggregates({
      symbol,
      timespan: 'day',
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      multiplier: 1,
    });

    if (!aggregates || aggregates.length === 0) {
      return { success: false, error: 'No historical data available' };
    }

    // Convert to more readable format
    const formattedData = aggregates.map(bar => ({
      timestamp: bar.t,
      open: bar.o,
      high: bar.h,
      low: bar.l,
      close: bar.c,
      volume: bar.v,
    }));

    await historicalCache.set(
      symbol,
      'day',
      formattedData,
      startDate,
      endDate,
      isFirstFetch
    );

    return { success: true };
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * GET /api/cron/historical
 * Fetches historical data for all 200 ETFs
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  // 1. Verify cron secret
  const authHeader = request.headers.get('authorization');
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  if (!authHeader || authHeader !== expectedAuth) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Invalid or missing cron secret' },
      { status: 401 }
    );
  }

  try {
    const results = {
      historical: { success: 0, failed: 0, errors: [] as string[] },
      symbols: CACHE_CONFIG.ALL_200_SYMBOLS.length,
      days: CACHE_CONFIG.HISTORICAL_DAYS_DAILY
    };

    // 2. Check if this is the first fetch overall
    let firstFetchOverall = true;
    for (const symbol of CACHE_CONFIG.TOP_50_SYMBOLS.slice(0, 5)) {
      if (await isFirstFetch(symbol)) {
        // At least one of the top 5 has no data
        break;
      }
      firstFetchOverall = false;
    }

    // 3. Process in batches of 10
    const batchSize = CACHE_CONFIG.ALL_200_BATCH_SIZE;
    const totalBatches = Math.ceil(CACHE_CONFIG.ALL_200_SYMBOLS.length / batchSize);

    for (let batch = 0; batch < totalBatches; batch++) {
      const startIdx = batch * batchSize;
      const endIdx = Math.min(startIdx + batchSize, CACHE_CONFIG.ALL_200_SYMBOLS.length);
      const batchSymbols = CACHE_CONFIG.ALL_200_SYMBOLS.slice(startIdx, endIdx);

      // Check first fetch status for this batch
      const firstFetchFlags = await Promise.all(
        batchSymbols.map(s => isFirstFetch(s))
      );

      for (let i = 0; i < batchSymbols.length; i++) {
        const symbol = batchSymbols[i];
        const isFirst = firstFetchFlags[i];

        const histResult = await fetchHistorical(symbol, isFirst);
        if (histResult.success) {
          results.historical.success++;
        } else {
          results.historical.failed++;
          if (histResult.error) results.historical.errors.push(`${symbol}: ${histResult.error}`);
        }

        // Rate limit delay
        if (i < batchSymbols.length - 1) {
          await delay(CACHE_CONFIG.RATE_LIMIT_DELAY_MS);
        }
      }

      // Delay between batches
      if (batch < totalBatches - 1) {
        await delay(5000); // 5 seconds between batches
      }
    }

    // 4. Log the fetch operation
    const duration = Date.now() - startTime;
    await prisma.marketDataFetchLog.create({
      data: {
        etfSymbols: [...CACHE_CONFIG.ALL_200_SYMBOLS],
        status: results.historical.failed === 0 ? 'success' : 'partial',
        fetchCount: results.historical.success,
        duration
      }
    });

    return NextResponse.json({
      status: 'success',
      tier: 'all-200',
      message: `Historical data (${results.days} days) updated for ${results.historical.success} ETFs`,
      isFirstFetch: firstFetchOverall,
      results: {
        historical: `${results.historical.success}/${results.historical.symbols}`,
      },
      errors: results.historical.errors.length > 0 ? results.historical.errors : undefined,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Historical cron job error:', error);

    await prisma.marketDataFetchLog.create({
      data: {
        etfSymbols: [...CACHE_CONFIG.ALL_200_SYMBOLS],
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        fetchCount: 0,
        duration: Date.now() - startTime
      }
    });

    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
