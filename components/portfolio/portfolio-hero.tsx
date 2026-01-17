"use client";

import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function PortfolioHero() {
  return (
    <Card className="glass-glow overflow-hidden">
      <div className="flex flex-col items-center gap-2 p-8">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Total Assets
        </p>
        <p className="text-4xl font-bold tracking-tight">$124,500.82</p>
        <div className="mt-1 flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1">
          <TrendingUp className="size-4 text-primary" />
          <p className="text-sm font-bold text-primary">+$1,492.00 (1.2%)</p>
        </div>
      </div>
    </Card>
  );
}
