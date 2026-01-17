"use client";

import { PageHeader, PageTitle, PageDescription } from "@/components/shared/page-header";
import { ETFSearch } from "@/components/explore/etf-search";
import { FilterChips } from "@/components/explore/filter-chips";
import { ETFList } from "@/components/explore/etf-list";
import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function ExplorePage() {
  const [tier, setTier] = useState<'top50' | 'all'>('top50');
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState<string | undefined>();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader>
        <PageTitle>Explore ETFs</PageTitle>
        <PageDescription>
          Discover and analyze {tier === 'top50' ? '50 most-traded' : '200'} ETFs with real-time data
        </PageDescription>
      </PageHeader>

      {/* Search Bar */}
      <div className="px-6">
        <Suspense fallback={<SearchSkeleton />}>
          <ETFSearch onSearch={setSearch} />
        </Suspense>
      </div>

      {/* Filter Chips */}
      <div className="px-6">
        <FilterChips
          tier={tier}
          onTierChange={setTier}
          sector={sector}
          onSectorChange={setSector}
        />
      </div>

      {/* Top 4 ETFs Cards */}
      <div className="px-6">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Top Picks
          </h2>
        </div>
        <TopETFsCards search={search} sector={sector} />
      </div>

      {/* All ETFs List */}
      <div className="px-6 pb-6">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            All ETFs
          </h2>
        </div>
        <ETFList
          tier={tier}
          search={search}
          sector={sector}
        />
      </div>
    </div>
  );
}

function TopETFsCards({ search, sector }: { search?: string; sector?: string }) {
  const [topETFs, setTopETFs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopETFs() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('tier', 'top50');
        if (search) params.set('search', search);
        if (sector) params.set('sector', sector);

        const response = await fetch(`/api/etf/list?${params.toString()}`);
        const data = await response.json();
        // Take first 4 ETFs that have data
        const withData = data.etfs.filter((etf: any) => etf.hasData).slice(0, 4);
        setTopETFs(withData);
      } catch (err) {
        console.error('Error fetching top ETFs:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTopETFs();
  }, [search, sector]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-40 rounded-xl border border-border bg-card animate-pulse" />
        ))}
      </div>
    );
  }

  if (topETFs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        Waiting for market data...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {topETFs.map((etf) => (
        <Link key={etf.id} href={`/deep-dive/${etf.symbol}`}>
          <Card className="glass-card group cursor-pointer transition-all hover:border-primary/40">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-lg">{etf.symbol}</span>
                    <Badge
                      variant="secondary"
                      className="text-[10px] bg-primary/20 text-primary border-primary/30"
                    >
                      Live
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{etf.name}</p>
                </div>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="font-bold text-2xl">${etf.price.toFixed(2)}</p>
                  <p
                    className={cn(
                      "text-sm font-medium flex items-center gap-1",
                      etf.change >= 0 ? "text-primary" : "text-destructive"
                    )}
                  >
                    {etf.change >= 0 ? "+" : ""}
                    {etf.change.toFixed(2)}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground">{etf.sector}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function SearchSkeleton() {
  return <Skeleton className="h-12 w-full rounded-full" />;
}
