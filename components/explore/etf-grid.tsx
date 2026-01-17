"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ETFGridProps {
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
  bid: number;
  ask: number;
  previousClose: number;
  hasData: boolean;
  fetchedAt?: string;
}

interface ETFListResponse {
  etfs: ETF[];
  sectors: string[];
  total: number;
  tier: string;
}

export function ETFGrid({ tier = 'top50', search, sector, className }: ETFGridProps) {
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

        const data: ETFListResponse = await response.json();
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
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4", className)}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-[220px] rounded-xl border border-border bg-card animate-pulse" />
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
                        etf.hasData ? "bg-primary/20 text-primary border-primary/30" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {etf.hasData ? "Live" : "Pending"}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                      {etf.sector}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-sm leading-tight mt-1">{etf.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {etf.symbol} • {etf.category}
                  </p>
                </div>
                <div className="text-right">
                  {etf.hasData ? (
                    <>
                      <p className="font-bold text-sm">${etf.price.toFixed(2)}</p>
                      <p
                        className={cn(
                          "text-xs font-medium",
                          etf.change >= 0 ? "text-primary" : "text-destructive"
                        )}
                      >
                        {etf.change >= 0 ? "+" : ""}
                        {etf.change.toFixed(2)}%
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No data yet</p>
                  )}
                </div>
              </div>

              {/* Sparkline */}
              {etf.hasData && (
                <div className="h-10 my-2">
                  <svg
                    viewBox="0 0 100 40"
                    className="w-full h-full"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id={`grid-gradient-${etf.symbol}`} x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={etf.change >= 0 ? "#2dd2b7" : "#f87171"} stopOpacity="0.2" />
                        <stop offset="100%" stopColor={etf.change >= 0 ? "#2dd2b7" : "#f87171"} stopOpacity="0" />
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
              )}

              <div className="mt-auto flex items-center justify-between pt-2 border-t border-border/50">
                {etf.fetchedAt && (
                  <span className="text-[10px] text-muted-foreground">
                    {getTimeAgo(new Date(etf.fetchedAt))}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
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

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
