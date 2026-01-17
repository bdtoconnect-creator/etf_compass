// ============================================
// xAI (Grok) Provider Implementation
// ============================================

import { AIService, AIAnalysis, AISignal, MarketData, AIError } from '../types';

/**
 * xAI Grok Provider
 * Note: xAI has an OpenAI-compatible API
 * We use the OpenAI SDK with a different base URL
 */

export class XAIProvider implements AIService {
  providerName = 'xai';
  modelName = 'grok-2';

  private apiKey: string;
  private baseURL = 'https://api.x.ai/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateScore(symbol: string, data: MarketData): Promise<AIAnalysis> {
    // xAI is primarily used for sentiment analysis
    // For scoring, we redirect to avoid unnecessary complexity
    throw new AIError(this.providerName, 'NOT_SUPPORTED', 'xAI provider is for sentiment analysis only');
  }

  async generateExplanation(symbol: string, analysis: AIAnalysis): Promise<string> {
    // xAI is primarily used for sentiment analysis
    throw new AIError(this.providerName, 'NOT_SUPPORTED', 'xAI provider is for sentiment analysis only');
  }

  async generateSentiment(symbol: string, marketContext?: string): Promise<AISignal> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'grok-2',
          messages: [
            {
              role: 'system',
              content: this.getSentimentSystemPrompt(),
            },
            {
              role: 'user',
              content: this.buildSentimentPrompt(symbol, marketContext),
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.4,
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        throw new AIError(this.providerName, 'API_ERROR', `HTTP ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new AIError(this.providerName, 'NO_CONTENT', 'Empty response from API');
      }

      const parsed = JSON.parse(content);

      return {
        sentiment: this.validateSentiment(parsed.sentiment),
        confidence: this.validateConfidenceValue(parsed.confidence),
        reasons: parsed.reasons || [],
        timeframe: parsed.timeframe || 'medium',
      };
    } catch (error) {
      if (error instanceof AIError) throw error;
      throw new AIError(this.providerName, 'SENTIMENT_FAILED', 'Failed to generate sentiment', error);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'grok-2',
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 5,
        }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // ============================================
  // Prompt Builders
  // ============================================

  private getSentimentSystemPrompt(): string {
    return `You are Grok, a market sentiment analyzer with access to real-time market context.

Analyze the sentiment for a given ETF considering:
- Current market conditions
- Sector performance
- Recent news and events
- Technical factors

Return JSON:
{
  "sentiment": "bullish" | "bearish" | "neutral",
  "confidence": number (0-1),
  "reasons": ["reason 1", "reason 2"],
  "timeframe": "short" | "medium" | "long"
}`;
  }

  private buildSentimentPrompt(symbol: string, marketContext?: string): string {
    return `Analyze the market sentiment for ${symbol}.${marketContext ? `\n\nMarket Context: ${marketContext}` : ''}

Use your knowledge of current market conditions, sector trends, and recent events to provide an accurate sentiment assessment.

Return JSON only.`;
  }

  // ============================================
  // Validators
  // ============================================

  private validateSentiment(value: any): 'bullish' | 'bearish' | 'neutral' {
    const valid = ['bullish', 'bearish', 'neutral'];
    return valid.includes(value) ? value : 'neutral';
  }

  private validateConfidenceValue(value: any): number {
    return Math.max(0, Math.min(1, Number(value) || 0.5));
  }
}
