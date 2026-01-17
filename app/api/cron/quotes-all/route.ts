// ============================================
// DAILY QUOTES ENDPOINT (All 200 ETFs)
// ============================================
// Fetches quotes for all 200 ETFs once per day
// Runs at 6 AM ET before market opens
// Rate limited to 5 requests/minute (Polygon free tier)

import { NextRequest, NextResponse } from 'next/server';
import { getPolygonClient } from '@/lib/api/polygon';
import { quoteCache } from '@/lib/cache/repositories/cache.repository';
import { CACHE_CONFIG } from '@/lib/cache/config';
import { prisma } from '@/lib/db/prisma';

/**
 * Delay helper for rate limiting
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch quote for a single symbol
 */
async function fetchQuote(symbol: string): Promise<{ success: boolean; error?: string }> {
  try {
    const polygon = getPolygonClient();
    const quote = await polygon.getLatestQuote(symbol);
    const prevClose = await polygon.getPreviousClose(symbol);

    if (!quote) {
      return { success: false, error: 'No quote data available' };
    }

    const midpoint = (quote.bid + quote.ask) / 2;
    const change = prevClose ? midpoint - prevClose.close : null;
    const changePercent = prevClose && prevClose.close > 0 ? (change! / prevClose.close) * 100 : null;

    // Use longer TTL for daily data (25 hours)
    await quoteCache.set(symbol, {
      bid: quote.bid,
      ask: quote.ask,
      midpoint,
      previousClose: prevClose?.close,
      change: change ?? undefined,
      changePercent: changePercent ?? undefined,
    }, CACHE_CONFIG.DAILY_TTL_MS);

    return { success: true };
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * GET /api/cron/quotes-all
 * Fetches daily quotes for all 200 ETFs
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

  // 2. Check for force parameter (for testing)
  const { searchParams } = new URL(request.url);
  const forceRun = searchParams.get('force') === 'true';

  try {
    const results = {
      quotes: { success: 0, failed: 0, errors: [] as string[] },
      symbols: CACHE_CONFIG.ALL_200_SYMBOLS.length
    };

    // 3. Process in batches of 10
    const batchSize = CACHE_CONFIG.ALL_200_BATCH_SIZE;
    const totalBatches = Math.ceil(CACHE_CONFIG.ALL_200_SYMBOLS.length / batchSize);

    for (let batch = 0; batch < totalBatches; batch++) {
      const startIdx = batch * batchSize;
      const endIdx = Math.min(startIdx + batchSize, CACHE_CONFIG.ALL_200_SYMBOLS.length);
      const batchSymbols = CACHE_CONFIG.ALL_200_SYMBOLS.slice(startIdx, endIdx);

      for (let i = 0; i < batchSymbols.length; i++) {
        const symbol = batchSymbols[i];

        const quoteResult = await fetchQuote(symbol);
        if (quoteResult.success) {
          results.quotes.success++;
        } else {
          results.quotes.failed++;
          if (quoteResult.error) results.quotes.errors.push(`${symbol}: ${quoteResult.error}`);
        }

        // Rate limit delay
        if (i < batchSymbols.length - 1) {
          await delay(CACHE_CONFIG.RATE_LIMIT_DELAY_MS);
        }
      }

      // Small delay between batches to prevent timeout
      if (batch < totalBatches - 1) {
        await delay(5000); // 5 seconds between batches
      }
    }

    // 4. Log the fetch operation
    const duration = Date.now() - startTime;
    await prisma.marketDataFetchLog.create({
      data: {
        etfSymbols: [...CACHE_CONFIG.ALL_200_SYMBOLS],
        status: results.quotes.failed === 0 ? 'success' : 'partial',
        fetchCount: results.quotes.success,
        duration
      }
    });

    return NextResponse.json({
      status: 'success',
      tier: 'all-200',
      message: `Daily quotes updated for ${results.quotes.success} ETFs`,
      results: {
        quotes: `${results.quotes.success}/${results.quotes.symbols}`,
      },
      errors: results.quotes.errors.length > 0 ? results.quotes.errors : undefined,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      forced: forceRun
    });

  } catch (error) {
    console.error('Daily quotes cron job error:', error);

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
