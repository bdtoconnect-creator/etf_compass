"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { cn } from "@/lib/utils";

interface SectorAllocationChartProps {
  className?: string;
}

const sectorData = [
  { name: "Technology", value: 35, color: "#2dd2b7" },
  { name: "Healthcare", value: 18, color: "#3b82f6" },
  { name: "Financials", value: 15, color: "#8b5cf6" },
  { name: "Consumer", value: 12, color: "#ec4899" },
  { name: "Industrials", value: 10, color: "#f59e0b" },
  { name: "Others", value: 10, color: "#6b7280" },
];

export function SectorAllocationChart({ className }: SectorAllocationChartProps) {
  return (
    <Card className={cn("glass-card", className)}>
      <CardHeader>
        <CardTitle className="text-base">Sector Allocation</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={sectorData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => (
                <tspan style={{ fontSize: "11px", fill: "hsl(var(--muted-foreground))" }}>
                  {name} {((percent || 0) * 100).toFixed(0)}%
                </tspan>
              )}
              labelLine={false}
            >
              {sectorData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number | undefined) => [`${value || 0}%`, "Allocation"]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
          {sectorData.map((sector) => (
            <div key={sector.name} className="flex items-center gap-2">
              <div
                className="size-3 rounded-full"
                style={{ backgroundColor: sector.color }}
              />
              <span className="text-muted-foreground">{sector.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
