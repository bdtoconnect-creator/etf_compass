import { PageHeader, PageTitle } from "@/components/shared/page-header";
import { ETFPriceHero } from "@/components/deep-dive/etf-price-hero";
import { ETFChart } from "@/components/deep-dive/etf-chart";
import { AIInsightsCard } from "@/components/deep-dive/ai-insights-card";
import { KeyMetricsGrid } from "@/components/deep-dive/key-metrics-grid";
import { TopHoldingsList } from "@/components/deep-dive/top-holdings-list";
import { ETFActions } from "@/components/deep-dive/etf-actions";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DeepDivePage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Header */}
      <div className="px-6">
        <Link href="/explore">
          <Button variant="ghost" size="sm" className="gap-1 -ml-2">
            <ArrowLeft className="size-4" />
            Back to Explore
          </Button>
        </Link>
      </div>

      <PageHeader variant="compact">
        <Suspense fallback={<PageTitleSkeleton />}>
          <ETFPageTitle params={params} />
        </Suspense>
      </PageHeader>

      {/* Price Hero */}
      <div className="px-6">
        <Suspense fallback={<PriceHeroSkeleton />}>
          <ETFPriceHeroWrapper params={params} />
        </Suspense>
      </div>

      {/* Chart */}
      <div className="px-6">
        <Suspense fallback={<ChartSkeleton />}>
          <ETFChartWrapper params={params} />
        </Suspense>
      </div>

      {/* AI Insights */}
      <div className="px-6">
        <Suspense fallback={<AIInsightsSkeleton />}>
          <AIInsightsCardWrapper params={params} />
        </Suspense>
      </div>

      {/* Key Metrics */}
      <div className="px-6">
        <Suspense fallback={<MetricsSkeleton />}>
          <KeyMetricsGridWrapper params={params} />
        </Suspense>
      </div>

      {/* Top Holdings */}
      <div className="px-6">
        <Suspense fallback={<HoldingsSkeleton />}>
          <TopHoldingsListWrapper params={params} />
        </Suspense>
      </div>

      {/* Fixed Action Bar */}
      <ETFActions />
    </div>
  );
}

async function ETFPageTitle({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  return <PageTitle>${symbol.toUpperCase()} Deep Dive</PageTitle>;
}

async function ETFPriceHeroWrapper({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  return <ETFPriceHero symbol={symbol} />;
}

async function ETFChartWrapper({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  return <ETFChart symbol={symbol} />;
}

async function AIInsightsCardWrapper({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  return <AIInsightsCard symbol={symbol} />;
}

async function KeyMetricsGridWrapper({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  return <KeyMetricsGrid symbol={symbol} />;
}

async function TopHoldingsListWrapper({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  return <TopHoldingsList symbol={symbol} />;
}

// Skeleton loaders
function PageTitleSkeleton() {
  return <Skeleton className="h-7 w-40" />;
}

function PriceHeroSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <Skeleton className="h-5 w-32 mb-2" />
      <div className="flex items-baseline gap-3">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-6 w-24" />
      </div>
      <Skeleton className="h-4 w-48 mt-2" />
    </div>
  );
}

function ChartSkeleton() {
  return <div className="rounded-xl border border-border bg-card h-[300px]" />;
}

function AIInsightsSkeleton() {
  return <div className="rounded-xl border border-border bg-card h-[140px]" />;
}

function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-xl border border-border bg-card h-[100px]" />
      ))}
    </div>
  );
}

function HoldingsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <div key={i} className="rounded-xl border border-border bg-card h-[70px]" />
      ))}
    </div>
  );
}
