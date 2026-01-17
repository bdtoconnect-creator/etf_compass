// ============================================
// AI Service Manager
// ============================================

import { AIService, AIAnalysis, AISignal, MarketData, AIError } from './types';
import { OpenAIProvider } from './providers/openai';
import { ClaudeProvider } from './providers/claude';
import { XAIProvider } from './providers/xai';

/**
 * AI Manager Configuration
 */
interface AIManagerConfig {
  mode: 'hybrid' | 'single';
  providers: {
    scoring: string;
    explanation: string;
    sentiment: string;
    fallback: string;
  };
  apiKeys: {
    openai?: string;
    claude?: string;
    xai?: string;
  };
}

/**
 * AI Service Manager
 *
 * Main entry point for all AI operations.
 * Handles provider selection, fallbacks, and cost tracking.
 */
export class AIServiceManager {
  private config: AIManagerConfig;
  private providers: Map<string, AIService>;
  private initialized = false;

  constructor(config?: Partial<AIManagerConfig>) {
    this.config = this.loadConfig(config);
    this.providers = new Map();
  }

  /**
   * Initialize all configured AI providers
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Initialize OpenAI
    if (this.config.apiKeys.openai) {
      try {
        const openai = new OpenAIProvider(this.config.apiKeys.openai);
        if (await openai.healthCheck()) {
          this.providers.set('openai', openai);
          console.log('[AI] OpenAI provider initialized');
        }
      } catch (error) {
        console.error('[AI] Failed to initialize OpenAI:', error);
      }
    }

    // Initialize Claude
    if (this.config.apiKeys.claude) {
      try {
        const claude = new ClaudeProvider(this.config.apiKeys.claude);
        if (await claude.healthCheck()) {
          this.providers.set('claude', claude);
          console.log('[AI] Claude provider initialized');
        }
      } catch (error) {
        console.error('[AI] Failed to initialize Claude:', error);
      }
    }

    // Initialize xAI
    if (this.config.apiKeys.xai) {
      try {
        const xai = new XAIProvider(this.config.apiKeys.xai);
        if (await xai.healthCheck()) {
          this.providers.set('xai', xai);
          console.log('[AI] xAI provider initialized');
        }
      } catch (error) {
        console.error('[AI] Failed to initialize xAI:', error);
      }
    }

    // Check if we have at least one provider
    if (this.providers.size === 0) {
      throw new Error('No AI providers available. Check your API keys.');
    }

    // Verify fallback provider is available
    if (!this.providers.has(this.config.providers.fallback)) {
      console.warn(`[AI] Fallback provider ${this.config.providers.fallback} not available, using first available`);
      const firstProvider = this.providers.keys().next().value;
      if (firstProvider) {
        this.config.providers.fallback = firstProvider;
      }
    }

    this.initialized = true;
    console.log(`[AI] Manager initialized with ${this.providers.size} provider(s)`);
  }

  /**
   * Generate complete AI analysis for an ETF
   */
  async analyzeETF(symbol: string, data: MarketData): Promise<AIAnalysis & { explanation?: string }> {
    this.ensureInitialized();

    try {
      if (this.config.mode === 'single') {
        // Single mode: Use fallback provider for everything
        return await this.analyzeWithSingleProvider(symbol, data);
      } else {
        // Hybrid mode: Use best provider for each task
        return await this.analyzeWithHybridProviders(symbol, data);
      }
    } catch (error) {
      console.error('[AI] Analysis failed:', error);
      throw error;
    }
  }

  /**
   * Generate score only (fast, for list views)
   */
  async getScore(symbol: string, data: MarketData): Promise<AIAnalysis> {
    this.ensureInitialized();

    const providerName = this.config.mode === 'single'
      ? this.config.providers.fallback
      : this.config.providers.scoring;

    const provider = this.getProvider(providerName);
    return await provider.generateScore(symbol, data);
  }

  /**
   * Generate explanation only (on demand, when user expands)
   */
  async getExplanation(symbol: string, analysis: AIAnalysis): Promise<string> {
    this.ensureInitialized();

    const providerName = this.config.mode === 'single'
      ? this.config.providers.fallback
      : this.config.providers.explanation;

    const provider = this.getProvider(providerName);
    return await provider.generateExplanation(symbol, analysis);
  }

  /**
   * Get market sentiment (for breaking news, alerts)
   */
  async getSentiment(symbol: string, marketContext?: string): Promise<AISignal> {
    this.ensureInitialized();

    // Sentiment is optional - if xAI not available, skip it
    if (this.config.mode === 'single' || !this.providers.has('xai')) {
      // Return neutral sentiment with low confidence
      return {
        sentiment: 'neutral',
        confidence: 0.5,
        reasons: ['Sentiment analysis not available'],
        timeframe: 'medium',
      };
    }

    const provider = this.getProvider(this.config.providers.sentiment);
    return await provider.generateSentiment(symbol, marketContext);
  }

  /**
   * Batch analyze multiple ETFs (for dashboard carousel)
   */
  async batchAnalyze(etfs: Array<{ symbol: string; data: MarketData }>): Promise<Map<string, AIAnalysis>> {
    this.ensureInitialized();

    const results = new Map<string, AIAnalysis>();
    const provider = this.getProvider(
      this.config.mode === 'single'
        ? this.config.providers.fallback
        : this.config.providers.scoring
    );

    // Process in parallel with concurrency limit
    const concurrency = 5;
    for (let i = 0; i < etfs.length; i += concurrency) {
      const batch = etfs.slice(i, i + concurrency);
      const analyses = await Promise.allSettled(
        batch.map(({ symbol, data }) => provider.generateScore(symbol, data))
      );

      for (let j = 0; j < batch.length; j++) {
        const result = analyses[j];
        if (result.status === 'fulfilled') {
          results.set(batch[j].symbol, result.value);
        } else {
          console.error(`[AI] Failed to analyze ${batch[j].symbol}:`, result.reason);
        }
      }
    }

    return results;
  }

  // ============================================
  // Private Methods
  // ============================================

  private async analyzeWithSingleProvider(symbol: string, data: MarketData): Promise<AIAnalysis & { explanation?: string }> {
    const provider = this.getProvider(this.config.providers.fallback);

    const analysis = await provider.generateScore(symbol, data);
    return analysis;
  }

  private async analyzeWithHybridProviders(symbol: string, data: MarketData): Promise<AIAnalysis & { explanation?: string }> {
    // Get score from scoring provider
    const scoringProvider = this.getProvider(this.config.providers.scoring);
    const analysis = await scoringProvider.generateScore(symbol, data);

    // Don't generate explanation for all ETFs - only on demand
    // This saves significant cost

    return analysis;
  }

  private getProvider(name: string): AIService {
    const provider = this.providers.get(name);
    if (!provider) {
      // Fall back to available provider
      const fallback = this.providers.get(this.config.providers.fallback);
      if (fallback) {
        console.warn(`[AI] Provider ${name} not available, using ${this.config.providers.fallback}`);
        return fallback;
      }
      throw new AIError('manager', 'NO_PROVIDER', `Provider ${name} not found and no fallback available`);
    }
    return provider;
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('AI Service Manager not initialized. Call initialize() first.');
    }
  }

  private loadConfig(config?: Partial<AIManagerConfig>): AIManagerConfig {
    return {
      mode: (config?.mode || process.env.AI_MODE as 'hybrid' | 'single') || 'hybrid',
      providers: {
        scoring: config?.providers?.scoring || process.env.AI_SCORING_PROVIDER || 'openai',
        explanation: config?.providers?.explanation || process.env.AI_EXPLANATION_PROVIDER || 'claude',
        sentiment: config?.providers?.sentiment || process.env.AI_SENTIMENT_PROVIDER || 'xai',
        fallback: config?.providers?.fallback || process.env.AI_FALLBACK_PROVIDER || 'openai',
      },
      apiKeys: {
        openai: config?.apiKeys?.openai || process.env.OPENAI_API_KEY,
        claude: config?.apiKeys?.claude || process.env.ANTHROPIC_API_KEY,
        xai: config?.apiKeys?.xai || process.env.XAI_API_KEY,
      },
    };
  }

  /**
   * Get provider statistics for monitoring
   */
  getStats() {
    return {
      initialized: this.initialized,
      mode: this.config.mode,
      availableProviders: Array.from(this.providers.keys()),
      providerConfig: this.config.providers,
    };
  }
}

// ============================================
// Singleton Instance
// ============================================

let aiManager: AIServiceManager | null = null;

export function getAIManager(): AIServiceManager {
  if (!aiManager) {
    aiManager = new AIServiceManager();
  }
  return aiManager;
}

export async function initializeAI(): Promise<void> {
  const manager = getAIManager();
  await manager.initialize();
}
