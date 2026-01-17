import { NextResponse } from 'next/server';
import { topPicksCache, isExpired } from '@/lib/cache/repositories/cache.repository';

const TOP_PICKS_SYMBOLS = ['VOO', 'QQQ', 'SCHD', 'VTI', 'VGT', 'XLK', 'XLF', 'JEPQ'];

export async function GET() {
  try {
    // Try cache first
    const cached = await topPicksCache.get();

    if (cached && !isExpired(cached.expiresAt)) {
      return NextResponse.json(cached.data as any[]);
    }

    // Cache miss or expired - return stale if available, else mock
    if (cached) {
      const data = Array.isArray(cached.data) ? cached.data : [];
      return NextResponse.json({
        ...data,
        _stale: true,
      });
    }

    // No cache available - return mock data
    const mockPicks = TOP_PICKS_SYMBOLS.map((symbol, index) => getMockETFData(symbol));
    mockPicks.sort((a, b) => b.aiScore - a.aiScore);
    mockPicks.forEach((etf, index) => etf.rank = index + 1);

    return NextResponse.json(mockPicks);
  } catch (error) {
    console.error('Error fetching top picks:', error);

    // Return mock data fallback
    const mockPicks = TOP_PICKS_SYMBOLS.map((symbol, index) => getMockETFData(symbol));
    mockPicks.sort((a, b) => b.aiScore - a.aiScore);
    mockPicks.forEach((etf, index) => etf.rank = index + 1);

    return NextResponse.json(mockPicks);
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

function getMockETFData(symbol: string) {
  const basePrice: Record<string, number> = {
    VOO: 410.25,
    QQQ: 455.80,
    SCHD: 78.45,
    VTI: 235.60,
    VGT: 425.30,
    XLK: 195.40,
    XLF: 42.15,
    JEPQ: 52.30,
  };

  const price = basePrice[symbol] || 100;
  const changePercent = (Math.random() - 0.4) * 5; // -2% to +3%
  const change = price * (changePercent / 100);

  // Generate weekly history
  const weeklyHistory = [];
  for (let i = 0; i < 7; i++) {
    weeklyHistory.push(price * (1 + (Math.random() - 0.5) * 0.04));
  }

  const aiScore = Math.floor(Math.random() * 30) + 70;
  let signal: 'buy' | 'hold' | 'sell';
  if (aiScore >= 85) signal = 'buy';
  else if (aiScore >= 70) signal = 'hold';
  else signal = 'sell';

  const riskLevels: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];

  return {
    symbol,
    name: getETFName(symbol),
    price: parseFloat(price.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(2)),
    aiScore,
    signal,
    riskLevel: riskLevels[Math.floor(Math.random() * riskLevels.length)],
    weeklyHistory,
    weekChange: parseFloat(((price - weeklyHistory[0]) / weeklyHistory[0] * 100).toFixed(2)),
    rank: 0,
  };
}
