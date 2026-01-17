import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ALL_200_ETFS, TOP_50 } from '@/lib/etf-symbols';
import { quoteCache } from '@/lib/cache/repositories/cache.repository';

// ETF metadata map with categories and sectors
const ETF_METADATA: Record<string, { name: string; category: string; sector: string }> = {
  // Large Cap
  'SPY': { name: 'SPDR S&P 500 ETF Trust', category: 'Large Cap', sector: 'Large Cap' },
  'VOO': { name: 'Vanguard S&P 500 ETF', category: 'Large Cap', sector: 'Large Cap' },
  'IVV': { name: 'iShares Core S&P 500 ETF', category: 'Large Cap', sector: 'Large Cap' },
  'QQQ': { name: 'Invesco QQQ Trust', category: 'Technology', sector: 'Technology' },
  'VTI': { name: 'Vanguard Total Stock Market ETF', category: 'Large Cap', sector: 'Large Cap' },
  'IWM': { name: 'iShares Russell 2000 ETF', category: 'Small Cap', sector: 'Small Cap' },
  'VTV': { name: 'Vanguard Value ETF', category: 'Large Cap', sector: 'Large Cap' },
  'VUG': { name: 'Vanguard Growth ETF', category: 'Large Cap', sector: 'Large Cap' },
  'SPLG': { name: 'SPDR Portfolio S&P 500 ETF', category: 'Large Cap', sector: 'Large Cap' },
  'GLD': { name: 'SPDR Gold Shares', category: 'Commodity', sector: 'Commodity' },

  // Technology
  'VGT': { name: 'Vanguard Information Technology ETF', category: 'Technology', sector: 'Technology' },
  'XLK': { name: 'Technology Select Sector SPDR Fund', category: 'Technology', sector: 'Technology' },
  'SOXX': { name: 'iShares Semiconductor ETF', category: 'Technology', sector: 'Technology' },
  'SMH': { name: 'VanEck Semiconductor ETF', category: 'Technology', sector: 'Technology' },
  'FTEC': { name: 'Fidelity MSCI Information Technology Index ETF', category: 'Technology', sector: 'Technology' },

  // Healthcare
  'XLV': { name: 'Health Care Select Sector SPDR Fund', category: 'Healthcare', sector: 'Healthcare' },
  'VHT': { name: 'Vanguard Health Care ETF', category: 'Healthcare', sector: 'Healthcare' },
  'IYH': { name: 'iShares U.S. Healthcare ETF', category: 'Healthcare', sector: 'Healthcare' },

  // Financials
  'XLF': { name: 'Financial Select Sector SPDR Fund', category: 'Financials', sector: 'Financials' },
  'VFH': { name: 'Vanguard Financials ETF', category: 'Financials', sector: 'Financials' },
  'IYF': { name: 'iShares U.S. Financials ETF', category: 'Financials', sector: 'Financials' },
  'KBE': { name: 'Invesco KBW Bank ETF', category: 'Financials', sector: 'Financials' },
  'KRE': { name: 'Invesco KBW Regional Banking ETF', category: 'Financials', sector: 'Financials' },

  // Dividend
  'SCHD': { name: 'Schwab U.S. Dividend Equity ETF', category: 'Dividend', sector: 'Dividend' },
  'VYM': { name: 'Vanguard High Dividend Yield ETF', category: 'Dividend', sector: 'Dividend' },
  'DVY': { name: 'iShares Select Dividend ETF', category: 'Dividend', sector: 'Dividend' },
  'SDY': { name: 'SPDR S&P Dividend ETF', category: 'Dividend', sector: 'Dividend' },
  'DGRO': { name: 'iShares Core Dividend Growth ETF', category: 'Dividend', sector: 'Dividend' },

  // Growth
  'JPMG': { name: 'JPMorgan Growth ETF', category: 'Growth', sector: 'Large Cap' },
  'MGK': { name: 'Vanguard Mega Cap Growth ETF', category: 'Growth', sector: 'Large Cap' },
  'SCHG': { name: 'Schwab U.S. Large-Cap Growth ETF', category: 'Growth', sector: 'Large Cap' },
  'IWF': { name: 'iShares Russell 1000 Growth ETF', category: 'Growth', sector: 'Large Cap' },
  'VONG': { name: 'Vanguard Russell 1000 Growth ETF', category: 'Growth', sector: 'Large Cap' },

  // International
  'EFA': { name: 'iShares MSCI EAFE ETF', category: 'International', sector: 'International' },
  'VEA': { name: 'Vanguard FTSE Developed Markets ETF', category: 'International', sector: 'International' },
  'VWO': { name: 'Vanguard Emerging Markets Stock Index ETF', category: 'International', sector: 'International' },
  'IEMG': { name: 'iShares Core MSCI Emerging Markets ETF', category: 'International', sector: 'International' },
  'IEFA': { name: 'iShares Core MSCI EAFE ETF', category: 'International', sector: 'International' },

  // Bonds
  'TLT': { name: 'iShares 20+ Year Treasury Bond ETF', category: 'Bonds', sector: 'Bonds' },
  'GOVT': { name: 'iShares U.S. Treasury Bond ETF', category: 'Bonds', sector: 'Bonds' },
  'BND': { name: 'Vanguard Total Bond Market ETF', category: 'Bonds', sector: 'Bonds' },
  'AGG': { name: 'iShares Core U.S. Aggregate Bond ETF', category: 'Bonds', sector: 'Bonds' },
  'SHV': { name: 'iShares Short Treasury Bond ETF', category: 'Bonds', sector: 'Bonds' },

  // Real Estate
  'VNQ': { name: 'Vanguard Real Estate ETF', category: 'Real Estate', sector: 'Real Estate' },
  'IYR': { name: 'iShares U.S. Real Estate ETF', category: 'Real Estate', sector: 'Real Estate' },
  'XLRE': { name: 'Real Estate Select Sector SPDR Fund', category: 'Real Estate', sector: 'Real Estate' },

  // Consumer
  'XLY': { name: 'Consumer Discretionary Select Sector SPDR Fund', category: 'Consumer', sector: 'Consumer' },
  'XLP': { name: 'Consumer Staples Select Sector SPDR Fund', category: 'Consumer', sector: 'Consumer' },
  'VCR': { name: 'Vanguard Consumer Discretionary ETF', category: 'Consumer', sector: 'Consumer' },
  'VDC': { name: 'Vanguard Consumer Staples ETF', category: 'Consumer', sector: 'Consumer' },

  // Utilities
  'XLU': { name: 'Utilities Select Sector SPDR Fund', category: 'Utilities', sector: 'Utilities' },
  'VPU': { name: 'Vanguard Utilities ETF', category: 'Utilities', sector: 'Utilities' },

  // Industrials
  'XLI': { name: 'Industrials Select Sector SPDR Fund', category: 'Industrials', sector: 'Industrials' },
  'VIS': { name: 'Vanguard Industrials ETF', category: 'Industrials', sector: 'Industrials' },

  // Materials
  'XLB': { name: 'Materials Select Sector SPDR Fund', category: 'Materials', sector: 'Materials' },
  'VAW': { name: 'Vanguard Materials ETF', category: 'Materials', sector: 'Materials' },

  // Energy
  'XLE': { name: 'Energy Select Sector SPDR Fund', category: 'Energy', sector: 'Energy' },
  'VDE': { name: 'Vanguard Energy ETF', category: 'Energy', sector: 'Energy' },

  // Specialty
  'JEPQ': { name: 'JPMorgan Nasdaq Equity Premium Income ETF', category: 'Income', sector: 'Technology' },
  'TSLY': { name: 'Tidal Trust II - YieldMax ETF', category: 'Income', sector: 'Technology' },
  'CONL': { name: 'YieldMax Universe Fund Option Income ETF', category: 'Income', sector: 'Multi' },
  'NUSI': { name: 'Nationwide Risk-Managed Income ETF', category: 'Income', sector: 'Multi' },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tier = searchParams.get('tier') || 'all'; // 'top50' or 'all'
    const search = searchParams.get('search')?.toLowerCase();
    const sector = searchParams.get('sector');

    // Get the symbol list based on tier
    const symbols = tier === 'top50' ? TOP_50 : ALL_200_ETFS;

    // Filter by search term if provided
    const filteredSymbols = symbols.filter(symbol => {
      if (search) {
        const metadata = ETF_METADATA[symbol];
        return (
          symbol.toLowerCase().includes(search) ||
          metadata?.name.toLowerCase().includes(search) ||
          metadata?.category.toLowerCase().includes(search)
        );
      }
      if (sector) {
        const metadata = ETF_METADATA[symbol];
        return metadata?.sector === sector;
      }
      return true;
    });

    // Fetch cached quotes for all symbols
    const etfData = await Promise.all(
      filteredSymbols.map(async (symbol) => {
        const cached = await quoteCache.get(symbol);
        const metadata = ETF_METADATA[symbol] || {
          name: `${symbol} ETF`,
          category: 'Other',
          sector: 'Other'
        };

        return {
          id: symbol,
          symbol,
          name: metadata.name,
          category: metadata.category,
          sector: metadata.sector,
          price: cached?.midpoint || 0,
          change: cached?.changePercent || 0,
          changeValue: cached?.change || 0,
          bid: cached?.bid || 0,
          ask: cached?.ask || 0,
          previousClose: cached?.previousClose || 0,
          hasData: !!cached,
          fetchedAt: cached?.fetchedAt,
        };
      })
    );

    // Get unique sectors
    const sectors = Array.from(
      new Set(
        filteredSymbols
          .map(s => ETF_METADATA[s]?.sector)
          .filter(Boolean)
      )
    ).sort();

    return NextResponse.json({
      etfs: etfData,
      sectors,
      total: etfData.length,
      tier,
    });
  } catch (error) {
    console.error('Error fetching ETF list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ETF list', etfs: [], sectors: [], total: 0 },
      { status: 500 }
    );
  }
}
