// ============================================
// AI Service Types
// ============================================

export interface MarketData {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  // Historical data points (last 24 hours)
  hourlyPrices: number[];
  // Technical indicators
  rsi?: number;
  sma20?: number;
  sma50?: number;
  volatility?: number;
}

export interface AIAnalysis {
  symbol: string;
  // Scoring (0-100)
  score: number;
  confidence: 'low' | 'medium' | 'high';
  // Recommendation
  signal: 'buy' | 'hold' | 'sell';
  // Risk assessment
  riskLevel: 'low' | 'medium' | 'high';
  // Explanation (optional - only generated when needed)
  explanation?: string;
  // Detailed reasoning (optional)
  reasoning?: string;
  // Key factors
  factors?: string[];
  // Timestamp
  analyzedAt: Date;
}

export interface AISignal {
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidence: number; // 0-1
  reasons: string[];
  timeframe: 'short' | 'medium' | 'long';
}

// ============================================
// AI Provider Interface
// ============================================

export interface AIService {
  /**
   * Generate AI analysis for an ETF
   * Returns score (0-100), signal, and key factors
   */
  generateScore(symbol: string, data: MarketData): Promise<AIAnalysis>;

  /**
   * Generate detailed user-friendly explanation
   * Called when user expands "Why AI?" section
   */
  generateExplanation(symbol: string, analysis: AIAnalysis): Promise<string>;

  /**
   * Generate market sentiment analysis
   * Factors in real-time market events (if provider supports it)
   */
  generateSentiment(symbol: string, marketContext?: string): Promise<AISignal>;

  /**
   * Health check - is this provider available?
   */
  healthCheck(): Promise<boolean>;

  /**
   * Provider name for logging
   */
  providerName: string;
  modelName: string;
}

// ============================================
// AI Request/Response Types
// ============================================

export interface AIRequestOptions {
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}

export interface AIResponse<T = any> {
  data: T;
  provider: string;
  model: string;
  tokensUsed?: {
    input: number;
    output: number;
  };
  cost?: number;
  latency: number; // ms
}

// ============================================
// Error Types
// ============================================

export class AIError extends Error {
  constructor(
    public provider: string,
    public code: string,
    message: string,
    public originalError?: any
  ) {
    super(`[${provider}] ${code}: ${message}`);
    this.name = 'AIError';
  }
}

export class AIRateLimitError extends AIError {
  constructor(provider: string, retryAfter?: number) {
    super(provider, 'RATE_LIMIT', 'Rate limit exceeded', { retryAfter });
    this.name = 'AIRateLimitError';
  }
}

export class AITimeoutError extends AIError {
  constructor(provider: string, timeout: number) {
    super(provider, 'TIMEOUT', `Request timeout after ${timeout}ms`, { timeout });
    this.name = 'AITimeoutError';
  }
}

// ============================================
// Cost Tracking
// ============================================

export interface AICostTracking {
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  timestamp: Date;
}

// ============================================
// Provider Configuration
// ============================================

export interface AIProviderConfig {
  apiKey: string;
  baseURL?: string;
  timeout?: number;
  maxRetries?: number;
}

// Pricing per 1M tokens (as of 2026)
export const AI_PRICING = {
  openai: {
    'gpt-4o-mini': { input: 0.15, output: 0.60 },
    'gpt-4o': { input: 2.50, output: 10.00 },
  },
  claude: {
    'claude-3.5-sonnet': { input: 3.00, output: 15.00 },
    'claude-3-opus': { input: 15.00, output: 75.00 },
  },
  xai: {
    'grok-2': { input: 0.50, output: 2.00 },
  },
} as const;
