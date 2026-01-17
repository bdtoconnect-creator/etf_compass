"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import { useState } from "react";

const timeRanges = ["1D", "1W", "1M", "1Y", "ALL"];

// Mock data - will be fetched from API
const chartData = [
  { time: "9:30", price: 458.50, upper: 462, lower: 455 },
  { time: "10:30", price: 459.80, upper: 463, lower: 456 },
  { time: "11:30", price: 460.20, upper: 464, lower: 457 },
  { time: "12:30", price: 461.50, upper: 465, lower: 458 },
  { time: "13:30", price: 462.00, upper: 466, lower: 459 },
  { time: "14:30", price: 461.80, upper: 465, lower: 458 },
  { time: "15:30", price: 462.84, upper: 467, lower: 460 },
  { time: "16:00", price: 462.84, upper: 467, lower: 460 },
];

export function ETFChart({ symbol }: { symbol: string }) {
  const [activeRange, setActiveRange] = useState("1M");

  return (
    <Card className="glass-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Performance & Volatility Band
            </p>
          </div>
          <div className="flex gap-1 bg-muted/50 p-1 rounded-full">
            {timeRanges.map((range) => (
              <Button
                key={range}
                variant="ghost"
                size="sm"
                onClick={() => setActiveRange(range)}
                className={cn(
                  "h-7 px-3 text-xs font-bold rounded-full",
                  activeRange === range
                    ? "bg-primary text-background-dark hover:bg-primary/90"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="bandGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(172 85% 52%)" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="hsl(172 85% 52%)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="time"
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
                domain={["dataMin - 5", "dataMax + 5"]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number | undefined) => [`$${(value || 0).toFixed(2)}`, "Price"]}
              />
              {/* Volatility Band */}
              <Area
                type="monotone"
                dataKey="upper"
                stroke="none"
                fill="url(#bandGradient)"
                opacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="lower"
                stroke="none"
                fill="url(#bandGradient)"
                opacity={0.3}
              />
              {/* Main Price Line */}
              <Area
                type="monotone"
                dataKey="price"
                stroke="hsl(172 85% 52%)"
                strokeWidth={3}
                fill="none"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-tighter mt-4">
          <span>9:30</span>
          <span>11:00</span>
          <span>12:30</span>
          <span>14:00</span>
          <span>16:00</span>
        </div>
      </CardContent>
    </Card>
  );
}
