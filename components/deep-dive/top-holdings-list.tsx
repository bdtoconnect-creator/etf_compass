"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function TopHoldingsList({ symbol }: { symbol: string }) {
  // Mock data - will be fetched from API
  const holdings = [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      weight: 22.4,
      change: 12.40,
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corp.",
      weight: 18.1,
      change: 8.12,
    },
    {
      symbol: "NVDA",
      name: "NVIDIA Corp.",
      weight: 14.2,
      change: 15.67,
    },
    {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      weight: 8.5,
      change: -2.34,
    },
    {
      symbol: "AMZN",
      name: "Amazon.com Inc.",
      weight: 7.8,
      change: 5.43,
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-foreground text-lg font-bold">Top Holdings</h3>
        <Button variant="link" className="text-primary p-0 h-auto text-sm font-bold">
          See All
        </Button>
      </div>

      {holdings.map((holding) => (
        <Card key={holding.symbol} className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-muted/30 flex items-center justify-center">
                  <span className="text-xs font-bold text-muted-foreground">
                    {holding.symbol.slice(0, 2)}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-sm">{holding.name}</p>
                  <p className="text-xs text-muted-foreground">{holding.symbol}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">{holding.weight}%</p>
                <p
                  className={cn(
                    "text-[10px]",
                    holding.change >= 0 ? "text-primary" : "text-destructive"
                  )}
                >
                  {holding.change >= 0 ? "+" : ""}${holding.change.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}
