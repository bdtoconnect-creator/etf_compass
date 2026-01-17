"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";

interface ETFListProps {
  tier?: 'top50' | 'all';
  search?: string;
  sector?: string;
  className?: string;
}

interface ETF {
  id: string;
  symbol: string;
  name: string;
  category: string;
  sector: string;
  price: number;
  change: number;
  changeValue: number;
  hasData: boolean;
  fetchedAt?: string;
}

export function ETFList({ tier = 'top50', search, sector, className }: ETFListProps) {
  const [etfs, setEtfs] = useState<ETF[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchETFs() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set('tier', tier);
        if (search) params.set('search', search);
        if (sector) params.set('sector', sector);

        const response = await fetch(`/api/etf/list?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch ETFs');
        }

        const data = await response.json();
        setEtfs(data.etfs);
      } catch (err) {
        console.error('Error fetching ETFs:', err);
        setError('Failed to load ETFs');
      } finally {
        setLoading(false);
      }
    }

    fetchETFs();
  }, [tier, search, sector]);

  if (loading) {
    return (
      <div className={cn("space-y-2", className)}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <div key={i} className="h-16 rounded-lg border border-border bg-card animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-primary hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (etfs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">No ETFs found matching your criteria</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {etfs.map((etf) => (
        <Link key={etf.id} href={`/deep-dive/${etf.symbol}`}>
          <div className="group flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:border-primary/40 transition-all cursor-pointer">
            <div className="flex items-center gap-4 flex-1">
              {/* Symbol & Name */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm">{etf.symbol}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {etf.sector}
                  </Badge>
                  {etf.hasData && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] bg-primary/20 text-primary border-primary/30"
                    >
                      Live
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{etf.name}</p>
              </div>

              {/* Price */}
              {etf.hasData ? (
                <div className="text-right min-w-[100px]">
                  <p className="font-bold text-sm">${etf.price.toFixed(2)}</p>
                  <div className={cn(
                    "flex items-center justify-end gap-1 text-xs font-medium",
                    etf.change >= 0 ? "text-primary" : "text-destructive"
                  )}>
                    {etf.change >= 0 ? (
                      <TrendingUp className="size-3" />
                    ) : (
                      <TrendingDown className="size-3" />
                    )}
                    <span>
                      {etf.change >= 0 ? "+" : ""}
                      {etf.change.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-right min-w-[100px]">
                  <p className="text-xs text-muted-foreground italic">No data yet</p>
                </div>
              )}

              {/* Chevron */}
              <ChevronRight className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
