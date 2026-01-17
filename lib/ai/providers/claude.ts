// ============================================
// Anthropic Claude Provider Implementation
// ============================================

import Anthropic from '@anthropic-ai/sdk';
import { AIService, AIAnalysis, MarketData, AIError } from '../types';

export class ClaudeProvider implements AIService {
  providerName = 'claude';
  modelName = 'claude-3.5-sonnet';

  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async generateScore(symbol: string, data: MarketData): Promise<AIAnalysis> {
    try {
      const prompt = this.buildScorePrompt(symbol, data);

      const response = await this.client.messages.create({
        model: this.modelName,
        max_tokens: 500,
        system: this.getSystemPrompt(),
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new AIError(this.providerName, 'INVALID_RESPONSE', 'Expected text response');
      }

      // Extract JSON from the response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new AIError(this.providerName, 'NO_JSON', 'No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        symbol,
        score: this.validateScore(parsed.score),
        confidence: this.validateConfidence(parsed.confidence),
        signal: this.validateSignal(parsed.signal),
        riskLevel: this.validateRiskLevel(parsed.riskLevel),
        factors: parsed.factors || [],
        analyzedAt: new Date(),
      };
    } catch (error) {
      if (error instanceof AIError) throw error;
      throw new AIError(this.providerName, 'SCORE_FAILED', 'Failed to generate score', error);
    }
  }

  async generateExplanation(symbol: string, analysis: AIAnalysis): Promise<string> {
    try {
      const response = await this.client.messages.create({
        model: this.modelName,
        max_tokens: 300,
        system: this.getExplanationSystemPrompt(),
        messages: [
          {
            role: 'user',
            content: this.buildExplanationPrompt(symbol, analysis),
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new AIError(this.providerName, 'INVALID_RESPONSE', 'Expected text response');
      }

      return content.text.trim();
    } catch (error) {
      throw new AIError(this.providerName, 'EXPLANATION_FAILED', 'Failed to generate explanation', error);
    }
  }

  async generateSentiment(symbol: string, marketContext?: string): Promise<any> {
    // Claude can be used for sentiment but we'll delegate to xAI in hybrid mode
    // Implementing for completeness
    try {
      const response = await this.client.messages.create({
        model: this.modelName,
        max_tokens: 300,
        system: this.getSentimentSystemPrompt(),
        messages: [
          {
            role: 'user',
            content: this.buildSentimentPrompt(symbol, marketContext),
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new AIError(this.providerName, 'INVALID_RESPONSE', 'Expected text response');
      }

      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new AIError(this.providerName, 'NO_JSON', 'No JSON found in response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      throw new AIError(this.providerName, 'SENTIMENT_FAILED', 'Failed to generate sentiment', error);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.messages.create({
        model: this.modelName,
        max_tokens: 5,
        messages: [{ role: 'user', content: 'ping' }],
      });
      return response.content[0]?.type === 'text';
    } catch {
      return false;
    }
  }

  // ============================================
  // Prompt Builders (Claude-optimized)
  // ============================================

  private getSystemPrompt(): string {
    return `You are an expert ETF analyst AI. Analyze ETFs and provide:
1. A score from 0-100 (higher is better)
2. A clear signal: buy, hold, or sell
3. Risk level: low, medium, or high
4. Key factors influencing your decision

Consider price momentum, volatility, volume patterns, technical indicators (RSI, SMAs), and overall market conditions.

Response must be valid JSON only:
{
  "score": number,
  "signal": "buy" | "hold" | "sell",
  "confidence": "low" | "medium" | "high",
  "riskLevel": "low" | "medium" | "high",
  "factors": ["factor 1", "factor 2"]
}`;
  }

  private buildScorePrompt(symbol: string, data: MarketData): string {
    const trend = data.changePercent > 0 ? 'positive' : data.changePercent < 0 ? 'negative' : 'neutral';
    const momentum = Math.abs(data.changePercent) > 1 ? 'strong' : 'modest';

    return `Analyze ${symbol} (${data.name}):

Current Data:
- Price: $${data.currentPrice.toFixed(2)}
- Change: ${data.change >= 0 ? '+' : ''}$${data.change.toFixed(2)} (${data.changePercent >= 0 ? '+' : ''}${data.changePercent.toFixed(2)}%)
- Day Range: $${data.low.toFixed(2)} - $${data.high.toFixed(2)}
- Volume: ${data.volume.toLocaleString()}

Technical Indicators:
- RSI: ${data.rsi?.toFixed(1) || 'N/A'} ${data.rsi ? (data.rsi < 30 ? '(oversold)' : data.rsi > 70 ? '(overbought)' : '(neutral)') : ''}
- SMA20: $${data.sma20?.toFixed(2) || 'N/A'}
- SMA50: $${data.sma50?.toFixed(2) || 'N/A'}
- Volatility: ${data.volatility?.toFixed(2) || 'N/A'}

Market Context:
- Trend: ${trend}
- Momentum: ${momentum}

Respond with JSON only.`;
  }

  private getExplanationSystemPrompt(): string {
    return `You are a friendly financial advisor explaining ETF recommendations to retail investors.

Use:
- Clear, simple language
- 2-3 sentences max
- Actionable insights
- Avoid jargon

Your explanation should help the user understand WHY the AI made this recommendation.`;
  }

  private buildExplanationPrompt(symbol: string, analysis: AIAnalysis): string {
    const signalMap = {
      buy: 'recommends buying',
      hold: 'suggests holding',
      sell: 'recommends selling',
    };

    return `Our AI ${signalMap[analysis.signal]} ${symbol} (score: ${analysis.score}/100, confidence: ${analysis.confidence}).

Key factors: ${analysis.factors?.join(', ') || 'None provided'}

Explain why in 2-3 simple sentences.`;
  }

  private getSentimentSystemPrompt(): string {
    return `Analyze market sentiment for an ETF.

Return JSON:
{
  "sentiment": "bullish" | "bearish" | "neutral",
  "confidence": number (0-1),
  "reasons": ["reason 1", "reason 2"],
  "timeframe": "short" | "medium" | "long"
}`;
  }

  private buildSentimentPrompt(symbol: string, marketContext?: string): string {
    return `Analyze market sentiment for ${symbol}.${marketContext ? `\n\nContext: ${marketContext}` : ''}

Consider broader market conditions, sector performance, and relevant factors.

Return JSON only.`;
  }

  // ============================================
  // Validators
  // ============================================

  private validateScore(value: any): number {
    return Math.round(Math.max(0, Math.min(100, Number(value) || 50)));
  }

  private validateConfidence(value: any): 'low' | 'medium' | 'high' {
    const valid = ['low', 'medium', 'high'];
    return valid.includes(value) ? value : 'medium';
  }

  private validateSignal(value: any): 'buy' | 'hold' | 'sell' {
    const valid = ['buy', 'hold', 'sell'];
    return valid.includes(value) ? value : 'hold';
  }

  private validateRiskLevel(value: any): 'low' | 'medium' | 'high' {
    const valid = ['low', 'medium', 'high'];
    return valid.includes(value) ? value : 'medium';
  }
}
