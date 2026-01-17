import { NextRequest, NextResponse } from 'next/server';
import { getPolygonClient } from '@/lib/api/polygon';
import { quoteCache, isExpired } from '@/lib/cache/repositories/cache.repository';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol is required' },
        { status: 400 }
      );
    }

    const upperSymbol = symbol.toUpperCase();

    // Try cache first
    const cached = await quoteCache.get(upperSymbol);

    if (cached && !isExpired(cached.expiresAt)) {
      return NextResponse.json({
        symbol: cached.symbol,
        bid: cached.bid,
        ask: cached.ask,
        midpoint: cached.midpoint,
        previousClose: cached.previousClose,
        change: cached.change,
        changePercent: cached.changePercent,
        _cached: true,
        fetchedAt: cached.fetchedAt.toISOString(),
      });
    }

    // Cache miss or expired - try to fetch fresh data
    const polygonClient = getPolygonClient();
    const quote = await polygonClient.getLatestQuote(symbol);
    const prevClose = await polygonClient.getPreviousClose(symbol);

    if (!quote) {
      // Return stale cache if available
      if (cached) {
        return NextResponse.json({
          symbol: cached.symbol,
          bid: cached.bid,
          ask: cached.ask,
          midpoint: cached.midpoint,
          previousClose: cached.previousClose,
          change: cached.change,
          changePercent: cached.changePercent,
          _cached: true,
          _stale: true,
          fetchedAt: cached.fetchedAt.toISOString(),
        });
      }

      return NextResponse.json(
        { error: 'Failed to fetch quote' },
        { status: 404 }
      );
    }

    const midpoint = (quote.bid + quote.ask) / 2;
    const change = prevClose ? midpoint - prevClose.close : null;
    const changePercent = prevClose && prevClose.close > 0 ? (change! / prevClose.close) * 100 : null;

    // Update cache with fresh data
    await quoteCache.set(upperSymbol, {
      bid: quote.bid,
      ask: quote.ask,
      midpoint,
      previousClose: prevClose?.close,
      change: change ?? undefined,
      changePercent: changePercent ?? undefined,
    });

    return NextResponse.json({
      symbol: upperSymbol,
      bid: quote.bid,
      ask: quote.ask,
      midpoint,
      previousClose: prevClose?.close,
      change,
      changePercent,
      timestamp: quote.timestamp,
      _cached: false,
    });
  } catch (error) {
    console.error('Error fetching quote:', error);

    // Return mock data if API is not configured
    if (error instanceof Error && error.message.includes('POLYGON_API_KEY')) {
      return NextResponse.json({
        symbol: (await params).symbol.toUpperCase(),
        bid: 410.25,
        ask: 410.30,
        midpoint: 410.275,
        timestamp: Date.now(),
        mock: true,
      });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
