// ============================================
// REAL-TIME QUOTES ENDPOINT (Top 50 ETFs)
// ============================================
// Fetches real-time quotes for top 50 most-traded ETFs
// Runs every 30 minutes during market hours (8 AM - 6 PM ET, Mon-Fri)
// Rate limited to 5 requests/minute (Polygon free tier)

import { NextRequest, NextResponse } from 'next/server';
import { getPolygonClient } from '@/lib/api/polygon';
import { quoteCache } from '@/lib/cache/repositories/cache.repository';
import { isMarketOpen, getMarketStatusMessage } from '@/lib/cache/market-hours';
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

    await quoteCache.set(symbol, {
      bid: quote.bid,
      ask: quote.ask,
      midpoint,
      previousClose: prevClose?.close,
      change: change ?? undefined,
      changePercent: changePercent ?? undefined,
    });

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
 * GET /api/cron/quotes
 * Fetches real-time quotes for top 50 ETFs every 30 minutes
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

  // 2. Check if market is open (unless force=true)
  const { searchParams } = new URL(request.url);
  const forceRun = searchParams.get('force') === 'true';

  if (!forceRun && !isMarketOpen()) {
    return NextResponse.json({
      status: 'skipped',
      reason: 'Market closed',
      message: getMarketStatusMessage(),
      timestamp: new Date().toISOString(),
      hint: 'Add ?force=true to bypass market hours check for testing'
    });
  }

  try {
    // Use REAL_TIME_SYMBOLS (20 ETFs) to fit within 5-minute timeout
    const symbolsToProcess = CACHE_CONFIG.REAL_TIME_SYMBOLS;

    const results = {
      quotes: { success: 0, failed: 0, errors: [] as string[] },
      symbols: symbolsToProcess.length,
      tier: 'real-time' as const
    };

    // 3. Process all 20 symbols (fits in ~4 minutes with rate limiting)
    const batchSize = CACHE_CONFIG.TOP_50_BATCH_SIZE;
    const totalBatches = Math.ceil(symbolsToProcess.length / batchSize);

    for (let batch = 0; batch < totalBatches; batch++) {
      const startIdx = batch * batchSize;
      const endIdx = Math.min(startIdx + batchSize, symbolsToProcess.length);
      const batchSymbols = symbolsToProcess.slice(startIdx, endIdx);

      for (let i = 0; i < batchSymbols.length; i++) {
        const symbol = batchSymbols[i];

        const quoteResult = await fetchQuote(symbol);
        if (quoteResult.success) {
          results.quotes.success++;
        } else {
          results.quotes.failed++;
          if (quoteResult.error) results.quotes.errors.push(`${symbol}: ${quoteResult.error}`);
        }

        // Rate limit delay (except last one)
        if (i < batchSymbols.length - 1 || batch < totalBatches - 1) {
          await delay(CACHE_CONFIG.RATE_LIMIT_DELAY_MS);
        }
      }
    }

    // 4. Log the fetch operation
    const duration = Date.now() - startTime;
    await prisma.marketDataFetchLog.create({
      data: {
        etfSymbols: [...symbolsToProcess],
        status: results.quotes.failed === 0 ? 'success' : 'partial',
        fetchCount: results.quotes.success,
        duration
      }
    });

    return NextResponse.json({
      status: 'success',
      tier: results.tier,
      message: `Real-time quotes updated for ${results.quotes.success}/${results.symbols} ETFs`,
      results: {
        quotes: `${results.quotes.success}/${results.symbols}`,
        processedIn: `${(duration / 1000).toFixed(1)}s`
      },
      errors: results.quotes.errors,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Quotes cron job error:', error);

    await prisma.marketDataFetchLog.create({
      data: {
        etfSymbols: [...symbolsToProcess],
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
