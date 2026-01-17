import { NextRequest, NextResponse } from 'next/server';
import { getPolygonClient } from '@/lib/api/polygon';

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

    const polygonClient = getPolygonClient();
    const details = await polygonClient.getTickerDetails(symbol);

    if (!details) {
      return NextResponse.json(
        { error: 'Failed to fetch ticker details' },
        { status: 404 }
      );
    }

    return NextResponse.json(details);
  } catch (error) {
    console.error('Error fetching ticker details:', error);

    // Return mock data if API is not configured
    if (error instanceof Error && error.message.includes('POLYGON_API_KEY')) {
      return NextResponse.json({
        ticker: (await params).symbol.toUpperCase(),
        name: 'Vanguard S&P 500 ETF',
        description: 'Tracks the performance of the S&P 500 Index',
        market: 'stocks',
        locale: 'us',
        currency_name: 'USD',
        mock: true,
      });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
