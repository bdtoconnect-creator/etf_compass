// ============================================
// Polygon.io Market Data API Client
// ============================================

/**
 * Polygon.io API Client for ETF market data
 *
 * Features:
 * - Fetch real-time and historical ETF data
 * - Hourly aggregation support
 * - Technical indicators
 * - Automatic retries with exponential backoff
 */

const POLYGON_BASE_URL = 'https://api.polygon.io/v2';

interface PolygonConfig {
  apiKey: string;
  timeout?: number;
  maxRetries?: number;
}

interface AggregatesQuery {
  symbol: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  timespan?: 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
  multiplier?: number; // The size of the timespan multiplier
  sort?: 'asc' | 'desc';
  limit?: number;
}

interface AggregateBar {
  o: number;  // Open
  h: number;  // High
  l: number;  // Low
  c: number;  // Close
  v: number;  // Volume
  t: number;  // Timestamp (ms)
  n?: number; // Number of items in aggregate
  vw?: number; // Volume weighted average price
}

interface PreviousClose {
  symbol: string;
  close: number;
  high: number;
  low: number;
  open: number;
  volume: number;
  from: string;
  to: string;
}

interface TickerDetails {
  symbol: string;
  name: string;
  description?: string;
  market: string;
  locale: string;
  type: string;
  currency_name: string;
  cik?: string;
  composite_figi?: string;
  share_class_figi?: string;
  market_cap?: number;
  phone_number?: string;
  address?: object;
  ticker_root?: string;
  ticker_suffix?: string;
  homepage_url?: string;
  total_employees?: number;
  list_date?: string;
  branding?: object;
  share_class_outstanding?: number;
  weighted_shares_outstanding?: number;
  round_lot?: number;
}

export class PolygonClient {
  private apiKey: string;
  private timeout: number;
  private maxRetries: number;

  constructor(config: PolygonConfig) {
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || 30000; // 30 seconds default
    this.maxRetries = config.maxRetries || 3;
  }

  /**
   * Fetch aggregated bars (OHLCV) for a symbol
   */
  async getAggregates(query: AggregatesQuery): Promise<AggregateBar[]> {
    const params = new URLSearchParams({
      adjusted: 'true',
      sort: query.sort || 'asc',
      limit: (query.limit || 50000).toString(),
    });

    // Use day timespan by default, but allow override
    const timespan = query.timespan || 'day';
    const multiplier = query.multiplier || 1;

    const url = `${POLYGON_BASE_URL}/aggs/ticker/${query.symbol}/range/${multiplier}/${timespan}/${query.startDate}/${query.endDate}?${params.toString()}`;

    const response = await this.fetchWithRetry(url);

    if (!response.ok) {
      throw new Error(`Polygon API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }

    return data.results;
  }

  /**
   * Fetch previous close for a symbol
   */
  async getPreviousClose(symbol: string): Promise<PreviousClose | null> {
    const url = `${POLYGON_BASE_URL}/aggs/ticker/${symbol}/prev?adjusted=true`;

    const response = await this.fetchWithRetry(url);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return null;
    }

    const result = data.results[0];

    return {
      symbol: data.ticker,
      close: result.c,
      high: result.h,
      low: result.l,
      open: result.o,
      volume: result.v,
      from: new Date(result.t).toISOString(),
      to: new Date(result.t + 86400000).toISOString(),
    };
  }

  /**
   * Fetch ticker details
   */
  async getTickerDetails(symbol: string): Promise<TickerDetails | null> {
    const url = `${POLYGON_BASE_URL}/reference/tickers/${symbol}`;

    const response = await this.fetchWithRetry(url);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data.results) {
      return null;
    }

    return data.results;
  }

  /**
   * Fetch latest quote (real-time price)
   */
  async getLatestQuote(symbol: string): Promise<{ bid: number; ask: number; timestamp: number } | null> {
    const url = `${POLYGON_BASE_URL}/last/nbbo/${symbol}`;

    const response = await this.fetchWithRetry(url);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data.results || data.results.last === null) {
      return null;
    }

    return {
      bid: data.results.last.bid,
      ask: data.results.last.ask,
      timestamp: data.results.last.t,
    };
  }

  /**
   * Fetch real-time aggregates (last trade)
   */
  async getRealTimeAggregates(symbol: string): Promise<AggregateBar | null> {
    // Get aggregates for today
    const today = new Date().toISOString().split('T')[0];
    const url = `${POLYGON_BASE_URL}/aggs/ticker/${symbol}/range/1/minute/${today}/${today}?adjusted=true&sort=desc&limit=1`;

    const response = await this.fetchWithRetry(url);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return null;
    }

    return data.results[0];
  }

  /**
   * Batch fetch aggregates for multiple symbols
   */
  async batchGetAggregates(symbols: string[], startDate: string, endDate: string): Promise<Map<string, AggregateBar[]>> {
    const results = new Map<string, AggregateBar[]>();

    // Process in parallel with concurrency limit
    const concurrency = 5;
    for (let i = 0; i < symbols.length; i += concurrency) {
      const batch = symbols.slice(i, i + concurrency);

      await Promise.allSettled(
        batch.map(async (symbol) => {
          try {
            const aggregates = await this.getAggregates({
              symbol,
              startDate,
              endDate,
              timespan: 'hour',
            });
            results.set(symbol, aggregates);
          } catch (error) {
            console.error(`Failed to fetch aggregates for ${symbol}:`, error);
            results.set(symbol, []);
          }
        })
      );
    }

    return results;
  }

  // ============================================
  // Private Methods
  // ============================================

  private async fetchWithRetry(url: string, retryCount = 0): Promise<Response> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${url}&apiKey=${this.apiKey}`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Rate limit handling
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '5', 10);

        if (retryCount < this.maxRetries) {
          const delay = Math.pow(2, retryCount) * 1000 + retryAfter * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
          return this.fetchWithRetry(url, retryCount + 1);
        }
      }

      return response;
    } catch (error) {
      if (retryCount < this.maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.fetchWithRetry(url, retryCount + 1);
      }
      throw error;
    }
  }
}

// ============================================
// Singleton Instance
// ============================================

let polygonClient: PolygonClient | null = null;

export function getPolygonClient(): PolygonClient {
  if (!polygonClient) {
    const apiKey = process.env.POLYGON_API_KEY;
    if (!apiKey) {
      throw new Error('POLYGON_API_KEY environment variable is not set');
    }
    polygonClient = new PolygonClient({ apiKey });
  }
  return polygonClient;
}

/**
 * Initialize Polygon client (call during app startup)
 */
export async function initializePolygonClient(): Promise<void> {
  const client = getPolygonClient();

  // Test connection with a simple request
  try {
    await client.getPreviousClose('SPY');
    console.log('[Polygon] Client initialized successfully');
  } catch (error) {
    console.error('[Polygon] Failed to initialize client:', error);
    throw error;
  }
}
