"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

interface PerformanceChartProps {
  type: "portfolio" | "volatility";
  className?: string;
}

// Mock data - will be fetched from API
const portfolioData = [
  { date: "Jan", value: 100000 },
  { date: "Feb", value: 105000 },
  { date: "Mar", value: 103000 },
  { date: "Apr", value: 112000 },
  { date: "May", value: 118000 },
  { date: "Jun", value: 115000 },
  { date: "Jul", value: 122000 },
  { date: "Aug", value: 124500 },
];

const volatilityData = [
  { date: "Jan", voo: 12, qqq: 18, spy: 11 },
  { date: "Feb", voo: 14, qqq: 22, spy: 13 },
  { date: "Mar", voo: 16, qqq: 25, spy: 15 },
  { date: "Apr", voo: 11, qqq: 20, spy: 10 },
  { date: "May", voo: 13, qqq: 19, spy: 12 },
  { date: "Jun", voo: 15, qqq: 24, spy: 14 },
  { date: "Jul", voo: 12, qqq: 21, spy: 11 },
  { date: "Aug", voo: 14, qqq: 23, spy: 13 },
];

export function PerformanceChart({ type, className }: PerformanceChartProps) {
  if (type === "portfolio") {
    return (
      <Card className={cn("glass-card", className)}>
        <CardHeader>
          <CardTitle className="text-base">Portfolio Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={portfolioData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(172 85% 52%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(172 85% 52%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number | undefined) => [`$${(value || 0).toLocaleString()}`, "Value"]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(172 85% 52%)"
                strokeWidth={2}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("glass-card", className)}>
      <CardHeader>
        <CardTitle className="text-base">Volatility Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={volatilityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              label={{ value: "%", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Line
              type="monotone"
              dataKey="voo"
              stroke="hsl(172 85% 52%)"
              strokeWidth={2}
              dot={false}
              name="VOO"
            />
            <Line
              type="monotone"
              dataKey="qqq"
              stroke="hsl(45 93% 47%)"
              strokeWidth={2}
              dot={false}
              name="QQQ"
            />
            <Line
              type="monotone"
              dataKey="spy"
              stroke="hsl(340 82% 52%)"
              strokeWidth={2}
              dot={false}
              name="SPY"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
