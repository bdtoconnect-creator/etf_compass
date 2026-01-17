"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ETFGridProps {
  className?: string;
}

// Mock data - will be fetched from API
const etfs = [
  {
    id: "1",
    symbol: "VOO",
    name: "Vanguard S&P 500",
    category: "Market Cap Growth",
    price: 428.12,
    change: 1.24,
    aiScore: 87,
    signal: "Strong Buy",
    riskLevel: "Low Risk",
    sector: "Large Cap",
  },
  {
    id: "2",
    symbol: "QQQ",
    name: "Invesco QQQ Trust",
    category: "Nasdaq-100 Index",
    price: 384.45,
    change: 2.15,
    aiScore: 82,
    signal: "Buy",
    riskLevel: "Med Risk",
    sector: "Technology",
  },
  {
    id: "3",
    symbol: "BOTZ",
    name: "Global X Robotics & AI",
    category: "Artificial Intelligence",
    price: 28.92,
    change: -0.42,
    aiScore: 58,
    signal: "Hold",
    riskLevel: "High Risk",
    sector: "Technology",
  },
  {
    id: "4",
    symbol: "SCHD",
    name: "Schwab US Dividend",
    category: "Value Focused",
    price: 74.18,
    change: 0.88,
    aiScore: 78,
    signal: "Outperform",
    riskLevel: "Low Risk",
    sector: "Dividend",
  },
  {
    id: "5",
    symbol: "VTI",
    name: "Vanguard Total Market",
    category: "Broad Market",
    price: 252.34,
    change: 0.95,
    aiScore: 75,
    signal: "Buy",
    riskLevel: "Low Risk",
    sector: "Large Cap",
  },
  {
    id: "6",
    symbol: "VGT",
    name: "Vanguard Info Tech",
    category: "Technology",
    price: 462.84,
    change: 1.14,
    aiScore: 72,
    signal: "Buy",
    riskLevel: "High Risk",
    sector: "Technology",
  },
  {
    id: "7",
    symbol: "VHT",
    name: "Vanguard Health Care",
    category: "Healthcare",
    price: 245.67,
    change: 0.45,
    aiScore: 68,
    signal: "Hold",
    riskLevel: "Med Risk",
    sector: "Healthcare",
  },
  {
    id: "8",
    symbol: "VNQ",
    name: "Vanguard Real Estate",
    category: "Real Estate",
    price: 98.23,
    change: -0.23,
    aiScore: 55,
    signal: "Hold",
    riskLevel: "Med Risk",
    sector: "Real Estate",
  },
];

export function ETFGrid({ className }: ETFGridProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4", className)}>
      {etfs.map((etf) => (
        <Link key={etf.id} href={`/deep-dive/${etf.symbol}`}>
          <Card className="glass-card group cursor-pointer transition-all hover:border-primary/40 h-full flex flex-col">
            <CardContent className="p-4 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[10px] font-bold uppercase py-0.5 px-2",
                        etf.signal === "Strong Buy" || etf.signal === "Buy" || etf.signal === "Outperform"
                          ? "bg-primary/20 text-primary border-primary/30"
                          : etf.signal === "Hold"
                          ? "bg-amber-400/20 text-amber-400 border-amber-400/30"
                          : "bg-red-400/20 text-red-400 border-red-400/30"
                      )}
                    >
                      {etf.signal}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                      {etf.riskLevel}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-sm leading-tight mt-1">{etf.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {etf.symbol} • {etf.category}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">${etf.price.toFixed(2)}</p>
                  <p
                    className={cn(
                      "text-xs font-medium",
                      etf.change >= 0 ? "text-primary" : "text-destructive"
                    )}
                  >
                    {etf.change >= 0 ? "+" : ""}
                    {etf.change}%
                  </p>
                </div>
              </div>

              {/* Sparkline */}
              <div className="h-10 my-2">
                <svg
                  viewBox="0 0 100 40"
                  className="w-full h-full"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id={`grid-gradient-${etf.symbol}`} x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#2dd2b7" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#2dd2b7" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d={generateSparkline(etf.change)}
                    fill={`url(#grid-gradient-${etf.symbol})`}
                  />
                  <path
                    d={generateSparkline(etf.change)}
                    fill="none"
                    stroke={etf.change >= 0 ? "#2dd2b7" : "#f87171"}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="mt-auto flex items-center justify-between pt-2 border-t border-border/50">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">AI Score</span>
                  <span
                    className={cn(
                      "text-sm font-bold",
                      etf.aiScore >= 70 ? "text-primary" : etf.aiScore >= 50 ? "text-amber-400" : "text-red-400"
                    )}
                  >
                    {etf.aiScore}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function generateSparkline(change: number): string {
  // Generate a simple sparkline path based on the change
  const points = [];
  let y = 30;
  const direction = change >= 0 ? -1 : 1;

  for (let x = 0; x <= 100; x += 10) {
    y += (Math.random() - 0.3) * 8 * direction;
    y = Math.max(10, Math.min(35, y));
    points.push(`${x === 0 ? "M" : "L"}${x},${y}`);
  }

  // Close the path for fill
  const fillPoints = [...points, `L100,40 L0,40 Z`];
  const strokePoints = points.join(" ");

  return strokePoints;
}
