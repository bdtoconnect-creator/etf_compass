"use client";

import { Card, CardContent } from "@/components/ui/card";

export function KeyMetricsGrid({ symbol }: { symbol: string }) {
  // Mock data - will be fetched from API
  const metrics = [
    {
      label: "Expense Ratio",
      value: "0.10%",
      note: "Lower than 85% of peers",
      noteColor: "text-primary",
    },
    {
      label: "Div. Yield",
      value: "0.68%",
      note: "Annualized",
      noteColor: "text-muted-foreground",
    },
    {
      label: "P/E Ratio",
      value: "32.4x",
      note: "Premium valuation",
      noteColor: "text-red-400",
    },
    {
      label: "AUM",
      value: "$64.2B",
      note: "Assets Managed",
      noteColor: "text-muted-foreground",
    },
  ];

  return (
    <>
      <h3 className="text-foreground text-lg font-bold px-1 mb-4">Key Metrics</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((metric) => (
          <Card key={metric.label} className="glass-card">
            <CardContent className="p-4 flex flex-col gap-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                {metric.label}
              </p>
              <p className="text-xl font-bold">{metric.value}</p>
              <p className={cn("text-[10px] font-medium", metric.noteColor)}>
                {metric.note}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}
