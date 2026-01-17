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

interface PerformanceComparisonChartProps {
  className?: string;
}

const performanceData = [
  { etf: "VOO", ytd: 18.5, color: "#2dd2b7" },
  { etf: "QQQ", ytd: 22.3, color: "#8b5cf6" },
  { etf: "SCHD", ytd: 12.8, color: "#3b82f6" },
  { etf: "VTI", ytd: 16.2, color: "#ec4899" },
  { etf: "VGT", ytd: 28.5, color: "#f59e0b" },
];

export function PerformanceComparisonChart({ className }: PerformanceComparisonChartProps) {
  return (
    <Card className={cn("glass-card", className)}>
      <CardHeader>
        <CardTitle className="text-base">YTD Performance Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={performanceData}
            layout="horizontal"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              type="number"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis
              type="category"
              dataKey="etf"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              width={50}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number | undefined) => [`${(value || 0).toFixed(1)}%`, "YTD Return"]}
            />
            <Bar
              dataKey="ytd"
              radius={[0, 4, 4, 0]}
              fill="#2dd2b7"
            >
              {performanceData.map((entry, index) => (
                <rect key={`gradient-${index}`} width="0" height="0">
                  <defs>
                    <linearGradient id={`barGradient-${index}`} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                      <stop offset="100%" stopColor={entry.color} stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                </rect>
              ))}
              {performanceData.map((entry, index) => (
                <Bar
                  key={entry.etf}
                  dataKey="ytd"
                  fill={`url(#barGradient-${index})`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Best Performer:</span>
          <span className="font-semibold text-primary">VGT (+28.5%)</span>
        </div>
      </CardContent>
    </Card>
  );
}
