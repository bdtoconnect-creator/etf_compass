"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, DollarSign, Trophy, PiggyBank } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface KPICardsProps {
  className?: string;
}

interface PortfolioData {
  portfolioValue: number;
  todayChange: number;
  todayChangePercent: number;
  annualDividendYield: number;
  dividendYieldPercent: number;
  topPerformer: {
    symbol: string;
    changePercent: number;
  };
  mock?: boolean;
}

export function KPICards({ className }: KPICardsProps) {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPortfolioData() {
      try {
        const response = await fetch('/api/portfolio');
        if (!response.ok) {
          throw new Error('Failed to fetch portfolio data');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Error fetching portfolio data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchPortfolioData();

    // Refresh every 60 seconds
    const interval = setInterval(fetchPortfolioData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) {
    return <KPICardsSkeleton className={className} />;
  }

  if (error) {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="glass-card overflow-hidden">
            <CardContent className="p-6">
              <p className="text-sm text-destructive">Failed to load data</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  const formatPercent = (value: number) =>
    `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      <KPICard
        label="Portfolio Value"
        value={formatCurrency(data.portfolioValue)}
        change={formatCurrency(data.todayChange)}
        changePercent={formatPercent(data.todayChangePercent)}
        positive={data.todayChange >= 0}
        icon={<Wallet className="size-5" />}
      />
      <KPICard
        label="Today's Return"
        value={formatCurrency(data.todayChange)}
        change={formatPercent(data.todayChangePercent)}
        changePercent={null}
        positive={data.todayChange >= 0}
        icon={<DollarSign className="size-5" />}
      />
      <KPICard
        label="Annual Dividend Yield"
        value={`${formatCurrency(data.annualDividendYield)}/yr`}
        change={`${data.dividendYieldPercent.toFixed(2)}%`}
        changePercent={null}
        positive={true}
        icon={<PiggyBank className="size-5" />}
      />
      <KPICard
        label="Top Performer (Today)"
        value={data.topPerformer.symbol}
        change={formatPercent(data.topPerformer.changePercent)}
        changePercent={null}
        positive={data.topPerformer.changePercent >= 0}
        icon={<Trophy className="size-5" />}
      />
    </div>
  );
}

interface KPICardProps {
  label: string;
  value: string;
  change: string;
  changePercent?: string | null;
  positive: boolean;
  icon: React.ReactNode;
}

function KPICard({
  label,
  value,
  change,
  changePercent,
  positive,
  icon,
}: KPICardProps) {
  return (
    <Card className="glass-card overflow-hidden animate-fade-in">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/20 text-primary">
            {icon}
          </div>
          <div className={cn(
            "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
            positive
              ? "bg-primary/10 text-primary"
              : "bg-destructive/10 text-destructive"
          )}>
            {positive ? (
              <TrendingUp className="size-3" />
            ) : (
              <TrendingDown className="size-3" />
            )}
            {change}
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold tracking-tight mt-1">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function KPICardsSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="glass-card overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="size-10 rounded-lg bg-primary/20 animate-pulse" />
              <div className="h-6 w-16 rounded-full bg-muted animate-pulse" />
            </div>
            <div className="mt-4">
              <div className="h-4 w-24 rounded bg-muted animate-pulse mb-2" />
              <div className="h-8 w-32 rounded bg-muted animate-pulse" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
