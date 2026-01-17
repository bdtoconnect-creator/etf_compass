// ============================================
// VERCEL CRON ENDPOINT
// ============================================
// Fetches ETF data from Polygon.io every 30 minutes
// First run: Full historical data (7 days)
// Subsequent runs: Only latest data (incremental)
// Only runs during market hours (8 AM - 6 PM ET, Mon-Fri)

import { NextRequest, NextResponse } from 'next/server';
import { getPolygonClient } from '@/lib/api/polygon';
import { isMarketOpen, getMarketStatusMessage } from '@/lib/cache/market-hours';
import { quoteCache, historicalCache, topPicksCache, getCacheStats } from '@/lib/cache/repositories/cache.repository';
import { CACHE_CONFIG } from '@/lib/cache/config';
import { prisma } from '@/lib/db/prisma';

/**
 * Delay helper for rate limiting
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch and cache quote data for a single symbol
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
 * Fetch historical data (with incremental support)
 * @param symbol - ETF symbol
 * @param isFirstFetch - true for initial full load, false for incremental updates
 */
async function fetchHistorical(symbol: string, isFirstFetch: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const polygon = getPolygonClient();

    // For first fetch, get 2 years of data (Polygon free tier)
    // For incremental updates, get just today's data
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(
      startDate.getDate() - (isFirstFetch ? CACHE_CONFIG.HISTORICAL_DAYS_FIRST_FETCH : CACHE_CONFIG.HISTORICAL_DAYS_INCREMENTAL)
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
      isFirstFetch // Pass flag for incremental handling
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
 * Check if this is the first time fetching data
 * (no historical data exists for any tracked symbol)
 */
async function isFirstFetch(): Promise<boolean> {
  for (const symbol of CACHE_CONFIG.TRACKED_SYMBOLS) {
    const exists = await historicalCache.exists(symbol, 'day');
    if (exists) return false;
  }
  return true;
}

/**
 * Fetch and compute top picks with AI scores
 */
async function fetchTopPicks(isFirstFetch: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const polygon = getPolygonClient();
    const topPicksData = [];

    for (const symbol of CACHE_CONFIG.TRACKED_SYMBOLS) {
      const prevClose = await polygon.getPreviousClose(symbol);
      const quote = await polygon.getLatestQuote(symbol);

      // Get historical data for weekly change (last 7 days)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const weeklyData = await polygon.getAggregates({
        symbol,
        timespan: 'day',
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        multiplier: 1,
      });

      const currentPrice = quote ? (quote.bid + quote.ask) / 2 : (prevClose?.close || 0);
      const previousClose = prevClose?.close || currentPrice;
      const change = currentPrice - previousClose;
      const changePercent = (change / previousClose) * 100;

      // Generate AI scores and signals (randomized for demo - replace with actual AI)
      const aiScore = Math.floor(Math.random() * 30) + 70; // 70-99
      let signal: 'buy' | 'hold' | 'sell';
      if (aiScore >= 85) signal = 'buy';
      else if (aiScore >= 70) signal = 'hold';
      else signal = 'sell';

      const riskLevels: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
      const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];

      topPicksData.push({
        symbol,
        name: getETFName(symbol),
        price: parseFloat(currentPrice.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        aiScore,
        signal,
        riskLevel,
        weeklyHistory: weeklyData.slice(-7).map(d => d.c),
        weekChange: weeklyData.length > 1
          ? parseFloat(((weeklyData[weeklyData.length - 1].c - weeklyData[0].c) / weeklyData[0].c * 100).toFixed(2))
          : 0,
        rank: 0, // Will be calculated after sorting
      });
    }

    // Sort by AI score and assign ranks
    topPicksData.sort((a, b) => b.aiScore - a.aiScore);
    topPicksData.forEach((etf, index) => etf.rank = index + 1);

    await topPicksCache.set(topPicksData);

    return { success: true };
  } catch (error) {
    console.error('Error fetching top picks:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

function getETFName(symbol: string): string {
  const names: Record<string, string> = {
    VOO: 'Vanguard S&P 500 ETF',
    QQQ: 'Invesco QQQ Trust',
    SCHD: 'Schwab US Dividend Equity ETF',
    VTI: 'Vanguard Total Stock Market ETF',
    VGT: 'Vanguard Information Technology ETF',
    XLK: 'Technology Select Sector SPDR Fund',
    XLF: 'Financial Select Sector SPDR Fund',
    JEPQ: 'JPMorgan Nasdaq Equity Premium Income ETF',
  };
  return names[symbol] || `${symbol} ETF`;
}

/**
 * GET /api/cron/fetch-data
 * Vercel Cron endpoint - runs every 30 minutes
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  // 1. Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  if (!authHeader || authHeader !== expectedAuth) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Invalid or missing cron secret' },
      { status: 401 }
    );
  }

  // 2. Check if market is open
  if (!isMarketOpen()) {
    return NextResponse.json({
      status: 'skipped',
      reason: 'Market closed',
      message: getMarketStatusMessage(),
      timestamp: new Date().toISOString()
    });
  }

  // 3. Check if this is the first fetch
  const firstFetch = await isFirstFetch();

  try {
    const results = {
      quotes: { success: 0, failed: 0, errors: [] as string[] },
      historical: { success: 0, failed: 0, errors: [] as string[] },
      topPicks: { success: false, error: null as string | null }
    };

    // 4. Fetch data with rate limiting
    for (let i = 0; i < CACHE_CONFIG.TRACKED_SYMBOLS.length; i++) {
      const symbol = CACHE_CONFIG.TRACKED_SYMBOLS[i];

      // Fetch quote (always get latest)
      const quoteResult = await fetchQuote(symbol);
      if (quoteResult.success) {
        results.quotes.success++;
      } else {
        results.quotes.failed++;
        if (quoteResult.error) results.quotes.errors.push(`${symbol}: ${quoteResult.error}`);
      }

      // Fetch historical (full or incremental based on firstFetch flag)
      const histResult = await fetchHistorical(symbol, firstFetch);
      if (histResult.success) {
        results.historical.success++;
      } else {
        results.historical.failed++;
        if (histResult.error) results.historical.errors.push(`${symbol}: ${histResult.error}`);
      }

      // Rate limit delay between symbols (except last one)
      if (i < CACHE_CONFIG.TRACKED_SYMBOLS.length - 1) {
        await delay(CACHE_CONFIG.RATE_LIMIT_DELAY_MS);
      }
    }

    // 5. Fetch top picks (after all individual data is cached)
    const topPicksResult = await fetchTopPicks(firstFetch);
    results.topPicks.success = topPicksResult.success;
    results.topPicks.error = topPicksResult.error || null;

    // 6. Log the fetch operation
    const duration = Date.now() - startTime;
    await prisma.marketDataFetchLog.create({
      data: {
        etfSymbols: [...CACHE_CONFIG.TRACKED_SYMBOLS],
        status: results.quotes.failed === 0 && results.historical.failed === 0 ? 'success' : 'partial',
        fetchCount: results.quotes.success + results.historical.success,
        duration
      }
    });

    // Get final cache stats
    const cacheStats = await getCacheStats();

    return NextResponse.json({
      status: 'success',
      isFirstFetch,
      message: firstFetch
        ? 'Initial full historical data loaded'
        : 'Incremental update completed',
      results: {
        quotes: `${results.quotes.success}/${CACHE_CONFIG.TRACKED_SYMBOLS.length}`,
        historical: `${results.historical.success}/${CACHE_CONFIG.TRACKED_SYMBOLS.length}`,
        topPicks: results.topPicks.success ? 'success' : 'failed'
      },
      errors: {
        quotes: results.quotes.errors,
        historical: results.historical.errors,
        topPicks: results.topPicks.error
      },
      cacheStats,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Cron job error:', error);

    // Log the failure
    await prisma.marketDataFetchLog.create({
      data: {
        etfSymbols: [...CACHE_CONFIG.TRACKED_SYMBOLS],
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
