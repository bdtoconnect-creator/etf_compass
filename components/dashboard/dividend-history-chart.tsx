"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

interface DividendHistoryChartProps {
  className?: string;
}

const dividendData = [
  { quarter: "Q1 2024", amount: 810 },
  { quarter: "Q2 2024", amount: 835 },
  { quarter: "Q3 2024", amount: 795 },
  { quarter: "Q4 2024", amount: 800 },
  { quarter: "Q1 2025", amount: 845 },
  { quarter: "Q2 2025", amount: 855 },
];

export function DividendHistoryChart({ className }: DividendHistoryChartProps) {
  return (
    <Card className={cn("glass-card", className)}>
      <CardHeader>
        <CardTitle className="text-base">Dividend History</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={dividendData}>
            <defs>
              <linearGradient id="dividendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(172 85% 52%)" stopOpacity={0.8} />
                <stop offset="100%" stopColor="hsl(172 85% 52%)" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="quarter"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number | undefined) => [`$${(value || 0).toFixed(2)}`, "Dividend"]}
            />
            <Bar
              dataKey="amount"
              fill="url(#dividendGradient)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total (Last 6 quarters):</span>
          <span className="font-semibold text-primary">$4,940.00</span>
        </div>
      </CardContent>
    </Card>
  );
}
