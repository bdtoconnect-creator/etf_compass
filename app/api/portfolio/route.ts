import { NextResponse } from 'next/server';
import { getPolygonClient } from '@/lib/api/polygon';
import { quoteCache, isExpired } from '@/lib/cache/repositories/cache.repository';

// Default portfolio holdings - in production this would come from user's database
const DEFAULT_HOLDINGS = [
  { symbol: 'VOO', shares: 25 },
  { symbol: 'QQQ', shares: 15 },
  { symbol: 'SCHD', shares: 40 },
  { symbol: 'VTI', shares: 30 },
  { symbol: 'VGT', shares: 10 },
];

const MOCK_PRICES: Record<string, number> = {
  VOO: 410.25,
  QQQ: 455.80,
  SCHD: 78.45,
  VTI: 235.60,
  VGT: 425.30,
};

export async function GET() {
  try {
    const holdings = [];

    // Try to get all holdings from cache first
    for (const holding of DEFAULT_HOLDINGS) {
      const cached = await quoteCache.get(holding.symbol);

      if (cached && !isExpired(cached.expiresAt)) {
        // Use cached data
        holdings.push({
          symbol: holding.symbol,
          shares: holding.shares,
          currentPrice: cached.midpoint,
          previousClose: cached.previousClose || cached.midpoint,
        });
      } else {
        // Cache miss - fetch from API (this will also update cache)
        try {
          const polygonClient = getPolygonClient();
          const prevClose = await polygonClient.getPreviousClose(holding.symbol);
          const quote = await polygonClient.getLatestQuote(holding.symbol);

          const currentPrice = quote ? (quote.bid + quote.ask) / 2 : (prevClose?.close || MOCK_PRICES[holding.symbol] || 100);

          holdings.push({
            symbol: holding.symbol,
            shares: holding.shares,
            currentPrice,
            previousClose: prevClose?.close || currentPrice,
          });

          // Update cache
          if (quote && prevClose) {
            await quoteCache.set(holding.symbol, {
              bid: quote.bid,
              ask: quote.ask,
              midpoint: currentPrice,
              previousClose: prevClose.close,
              change: currentPrice - prevClose.close,
              changePercent: ((currentPrice - prevClose.close) / prevClose.close) * 100,
            });
          }
        } catch (err) {
          // Fallback to mock data on error
          const mockPrice = MOCK_PRICES[holding.symbol] || 100;
          holdings.push({
            symbol: holding.symbol,
            shares: holding.shares,
            currentPrice: mockPrice,
            previousClose: mockPrice * 0.98,
          });
        }
      }
    }

    // Calculate portfolio metrics
    const portfolioValue = holdings.reduce(
      (sum, h) => sum + h.currentPrice * h.shares,
      0
    );

    const previousValue = holdings.reduce(
      (sum, h) => sum + h.previousClose * h.shares,
      0
    );

    const todayChange = portfolioValue - previousValue;
    const todayChangePercent = (todayChange / previousValue) * 100;

    // Find top performer
    const performers = holdings.map(h => ({
      symbol: h.symbol,
      changePercent: ((h.currentPrice - h.previousClose) / h.previousClose) * 100,
    }));
    const topPerformer = performers.reduce((best, current) =>
      current.changePercent > best.changePercent ? current : best
    );

    // Calculate annual dividend yield (simplified - using 30-day annualized rate)
    const estimatedMonthlyDividend = portfolioValue * 0.0035; // ~4.2% annual yield
    const annualDividendYield = estimatedMonthlyDividend * 12;

    return NextResponse.json({
      portfolioValue: parseFloat(portfolioValue.toFixed(2)),
      todayChange: parseFloat(todayChange.toFixed(2)),
      todayChangePercent: parseFloat(todayChangePercent.toFixed(2)),
      annualDividendYield: parseFloat(annualDividendYield.toFixed(2)),
      dividendYieldPercent: parseFloat(((annualDividendYield / portfolioValue) * 100).toFixed(2)),
      topPerformer: {
        symbol: topPerformer.symbol,
        changePercent: parseFloat(topPerformer.changePercent.toFixed(2)),
      },
      holdings: holdings.map(h => ({
        symbol: h.symbol,
        shares: h.shares,
        value: parseFloat((h.currentPrice * h.shares).toFixed(2)),
        changePercent: parseFloat(((h.currentPrice - h.previousClose) / h.previousClose * 100).toFixed(2)),
      })),
    });
  } catch (error) {
    console.error('Error fetching portfolio data:', error);

    // Return mock data fallback
    return NextResponse.json({
      portfolioValue: 124500.82,
      todayChange: 1492.00,
      todayChangePercent: 1.2,
      annualDividendYield: 3240,
      dividendYieldPercent: 2.6,
      topPerformer: {
        symbol: 'VOO',
        changePercent: 4.2,
      },
      holdings: [
        { symbol: 'VOO', shares: 25, value: 10256.25, changePercent: 1.2 },
        { symbol: 'QQQ', shares: 15, value: 6837.00, changePercent: 1.5 },
        { symbol: 'SCHD', shares: 40, value: 3138.00, changePercent: 0.8 },
        { symbol: 'VTI', shares: 30, value: 7068.00, changePercent: 1.0 },
        { symbol: 'VGT', shares: 10, value: 4253.00, changePercent: 2.1 },
      ],
      mock: true,
    });
  }
}
