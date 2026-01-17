import { NextRequest, NextResponse } from 'next/server';
import { getPolygonClient } from '@/lib/api/polygon';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const searchParams = request.nextUrl.searchParams;
    const timespan = (searchParams.get('timespan') || 'day') as 'day' | 'week' | 'month' | 'quarter' | 'year';
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol is required' },
        { status: 400 }
      );
    }

    const polygonClient = getPolygonClient();

    // Default to last 30 days if no dates provided
    const endDate = to ? new Date(to) : new Date();
    const startDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const aggregates = await polygonClient.getAggregates({
      symbol,
      timespan,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      multiplier: 1,
    });

    return NextResponse.json({
      symbol: symbol.toUpperCase(),
      data: aggregates,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching historical data:', error);

    // Return mock data if API is not configured
    if (error instanceof Error && error.message.includes('POLYGON_API_KEY')) {
      const mockData = generateMockHistoryData((await params).symbol.toUpperCase());
      return NextResponse.json({
        symbol: (await params).symbol.toUpperCase(),
        data: mockData,
        mock: true,
      });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateMockHistoryData(symbol: string) {
  const data = [];
  const basePrice = 400;
  const days = 30;

  for (let i = 0; i < days; i++) {
    const date = new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000);
    const open = basePrice + (Math.random() - 0.5) * 20;
    const close = open + (Math.random() - 0.5) * 10;
    const high = Math.max(open, close) + Math.random() * 5;
    const low = Math.min(open, close) - Math.random() * 5;

    data.push({
      timestamp: date.getTime(),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(Math.random() * 1000000) + 500000,
    });
  }

  return data;
}
