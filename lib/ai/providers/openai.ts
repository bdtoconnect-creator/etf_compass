// ============================================
// OpenAI Provider Implementation
// ============================================

import OpenAI from 'openai';
import { AIService, AIAnalysis, AISignal, MarketData, AIError, AI_PRICING } from '../types';

export class OpenAIProvider implements AIService {
  providerName = 'openai';
  modelName = 'gpt-4o-mini';

  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async generateScore(symbol: string, data: MarketData): Promise<AIAnalysis> {
    const startTime = Date.now();

    try {
      const prompt = this.buildScorePrompt(symbol, data);

      const response = await this.client.chat.completions.create({
        model: this.modelName,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new AIError(this.providerName, 'NO_CONTENT', 'Empty response from API');
      }

      const parsed = JSON.parse(content);

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
      const response = await this.client.chat.completions.create({
        model: this.modelName,
        messages: [
          {
            role: 'system',
            content: this.getExplanationSystemPrompt(),
          },
          {
            role: 'user',
            content: this.buildExplanationPrompt(symbol, analysis),
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      });

      return response.choices[0]?.message?.content || 'Unable to generate explanation.';
    } catch (error) {
      throw new AIError(this.providerName, 'EXPLANATION_FAILED', 'Failed to generate explanation', error);
    }
  }

  async generateSentiment(symbol: string, marketContext?: string): Promise<AISignal> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.modelName,
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
      });

      const content = response.choices[0]?.message?.content;
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
      const response = await this.client.chat.completions.create({
        model: this.modelName,
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 5,
      });
      return !!response.choices[0]?.message?.content;
    } catch {
      return false;
    }
  }

  // ============================================
  // Prompt Builders
  // ============================================

  private getSystemPrompt(): string {
    return `You are an expert ETF analyst AI. Your role is to analyze Exchange Traded Funds and provide:
1. A score from 0-100 (higher is better)
2. A clear signal: buy, hold, or sell
3. Risk level: low, medium, or high
4. Key factors influencing your decision

Consider:
- Price momentum and trend direction
- Volatility and risk
- Volume patterns
- Technical indicators (RSI, SMAs)
- Overall market conditions

Return ONLY a JSON object with this exact structure:
{
  "score": number (0-100),
  "signal": "buy" | "hold" | "sell",
  "confidence": "low" | "medium" | "high",
  "riskLevel": "low" | "medium" | "high",
  "factors": ["factor 1", "factor 2", ...]
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

Provide your analysis as JSON.`;
  }

  private getExplanationSystemPrompt(): string {
    return `You are a friendly financial advisor explaining an ETF recommendation in simple terms.

Your audience is retail investors who may not be experts. Use:
- Clear, non-technical language
- Simple analogies when helpful
- Concise explanations (2-3 sentences)
- Actionable insights

Avoid:
- Jargon without explanation
- Overly technical analysis
- Financial advice disclaimers (assume user knows this is not advice)`;
  }

  private buildExplanationPrompt(symbol: string, analysis: AIAnalysis): string {
    const signalMap = {
      buy: 'recommends buying',
      hold: 'suggests holding',
      sell: 'recommends selling',
    };

    return `Our AI ${signalMap[analysis.signal]} ${symbol} with a score of ${analysis.score}/100 and ${analysis.confidence} confidence.

Key factors: ${analysis.factors?.join(', ') || 'None provided'}

Explain in 2-3 sentences why this recommendation makes sense for the current market conditions. Be specific about what's driving this signal.`;
  }

  private getSentimentSystemPrompt(): string {
    return `You are a market sentiment analyst. Analyze the overall market sentiment for a given ETF.

Return ONLY a JSON object with this exact structure:
{
  "sentiment": "bullish" | "bearish" | "neutral",
  "confidence": number (0-1),
  "reasons": ["reason 1", "reason 2", ...],
  "timeframe": "short" | "medium" | "long"
}`;
  }

  private buildSentimentPrompt(symbol: string, marketContext?: string): string {
    return `Analyze the market sentiment for ${symbol}.${marketContext ? `\n\nMarket Context: ${marketContext}` : ''}

Consider the broader market conditions, sector performance, and any relevant factors that could affect this ETF in the near term.

Provide your analysis as JSON.`;
  }

  // ============================================
  // Validators
  // ============================================

  private validateScore(value: any): number {
    const score = Math.round(Math.max(0, Math.min(100, Number(value) || 50)));
    return score;
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

  private validateSentiment(value: any): 'bullish' | 'bearish' | 'neutral' {
    const valid = ['bullish', 'bearish', 'neutral'];
    return valid.includes(value) ? value : 'neutral';
  }

  private validateConfidenceValue(value: any): number {
    return Math.max(0, Math.min(1, Number(value) || 0.5));
  }
}
