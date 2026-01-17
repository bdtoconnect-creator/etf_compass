"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface HoldingsTableProps {
  className?: string;
}

// Mock data - will be fetched from API
const holdings = [
  {
    id: "1",
    symbol: "VOO",
    name: "Vanguard S&P 500",
    allocation: 42,
    currentValue: 52490.12,
    profitLoss: 8240.12,
    profitLossPercent: 18.6,
    aiSignal: "BUY",
    aiScore: 87,
    explanation: "Strong momentum in the tech sector; RSI indicates oversold conditions. Market breadth is widening, suggesting a breakout above 5,200 level.",
  },
  {
    id: "2",
    symbol: "QQQ",
    name: "Invesco QQQ Trust",
    allocation: 35,
    currentValue: 43575.55,
    profitLoss: 4120.55,
    profitLossPercent: 10.4,
    aiSignal: "HOLD",
    aiScore: 82,
    explanation: "Valuations are stretched in semiconductor segments. Maintaining position is advised until next earnings cycle confirms guidance.",
  },
  {
    id: "3",
    symbol: "ARKK",
    name: "ARK Innovation",
    allocation: 10,
    currentValue: 12450.20,
    profitLoss: -1240.20,
    profitLossPercent: -9.1,
    aiSignal: "SELL",
    aiScore: 42,
    explanation: "High interest rate environment continues to pressure non-profitable tech components. Rotation into value ETFs suggested for portfolio balance.",
  },
  {
    id: "4",
    symbol: "VTI",
    name: "Vanguard Total Mkt",
    allocation: 13,
    currentValue: 16185.40,
    profitLoss: 2110.40,
    profitLossPercent: 15.0,
    aiSignal: "BUY",
    aiScore: 75,
    explanation: "Broad market exposure remains favorable as inflation cooling signals potentially lower yields in the mid-term.",
  },
];

export function HoldingsTable({ className }: HoldingsTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className={cn("space-y-3", className)}>
      {holdings.map((holding) => (
        <Card
          key={holding.id}
          className="glass-card overflow-hidden hover:border-primary/20 transition-colors"
        >
          <CardContent className="p-0">
            {/* Main Row */}
            <div className="flex items-center gap-4 p-4 min-h-[80px]">
              {/* ETF Icon */}
              <div
                className={cn(
                  "flex items-center justify-center rounded-lg size-12 font-bold text-sm",
                  holding.aiSignal === "BUY"
                    ? "bg-primary/20 text-primary"
                    : holding.aiSignal === "HOLD"
                    ? "bg-amber-500/20 text-amber-500"
                    : "bg-red-500/20 text-red-500"
                )}
              >
                {holding.symbol}
              </div>

              {/* ETF Info */}
              <div className="flex-1">
                <p className="font-semibold text-sm">{holding.name}</p>
                <p className="text-xs text-muted-foreground">
                  {holding.allocation}% Allocation
                </p>
              </div>

              {/* P&L */}
              <div className="text-right">
                <p
                  className={cn(
                    "font-semibold text-sm",
                    holding.profitLoss >= 0 ? "text-primary" : "text-destructive"
                  )}
                >
                  {holding.profitLoss >= 0 ? "+" : ""}$
                  {holding.profitLoss.toLocaleString()}
                </p>
              </div>

              {/* AI Signal Badge */}
              <Badge
                variant="secondary"
                className={cn(
                  "text-[10px] font-black py-1.5 px-3 uppercase tracking-widest",
                  holding.aiSignal === "BUY"
                    ? "bg-primary/20 text-primary"
                    : holding.aiSignal === "HOLD"
                    ? "bg-amber-500/20 text-amber-500"
                    : "bg-red-500/20 text-red-500"
                )}
              >
                {holding.aiSignal}
              </Badge>
            </div>

            {/* Expandable AI Explanation */}
            {expandedId === holding.id && (
              <div className="px-4 pb-4 border-t border-border/50 pt-3 animate-slide-up">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-xs font-bold text-muted-foreground">WHY AI?</span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground p-3 bg-muted/30 rounded-lg border border-border/50">
                  {holding.explanation}
                </p>
              </div>
            )}

            {/* Expand Button */}
            <button
              onClick={() =>
                setExpandedId(expandedId === holding.id ? null : holding.id)
              }
              className="absolute bottom-2 right-4 p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronDown
                className={cn(
                  "size-5 transition-transform",
                  expandedId === holding.id && "rotate-180"
                )}
              />
            </button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
