import { PageHeader, PageTitle, PageDescription } from "@/components/shared/page-header";
import { KPICards } from "@/components/dashboard/kpi-cards";
import { TopPicksCarousel } from "@/components/dashboard/top-picks-carousel";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { SectorAllocationChart } from "@/components/dashboard/sector-allocation-chart";
import { DividendHistoryChart } from "@/components/dashboard/dividend-history-chart";
import { PerformanceComparisonChart } from "@/components/dashboard/performance-comparison-chart";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader>
        <PageTitle>Dashboard</PageTitle>
        <PageDescription>
          AI-powered ETF analysis and portfolio insights
        </PageDescription>
      </PageHeader>

      {/* KPI Cards */}
      <Suspense fallback={<KPICardsSkeleton />}>
        <KPICards />
      </Suspense>

      {/* Top AI Picks Carousel */}
      <div className="relative">
        <div className="flex items-center justify-between px-6 pb-16 sm:pb-6 relative z-20">
          <h2 className="text-lg font-semibold">Top AI Picks</h2>
          <a href="/explore" className="text-sm text-primary hover:underline">
            View all →
          </a>
        </div>
        <Suspense fallback={<CarouselSkeleton />}>
          <TopPicksCarousel />
        </Suspense>
      </div>

      {/* Performance Charts */}
      <div>
        <h2 className="text-lg font-semibold px-6 mb-4">Portfolio Analytics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6">
          <Suspense fallback={<ChartSkeleton />}>
            <PerformanceChart type="portfolio" />
          </Suspense>
          <Suspense fallback={<ChartSkeleton />}>
            <SectorAllocationChart />
          </Suspense>
        </div>
      </div>

      {/* More Analytics */}
      <div>
        <h2 className="text-lg font-semibold px-6 mb-4">Dividend & Comparison</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6">
          <Suspense fallback={<ChartSkeleton />}>
            <DividendHistoryChart />
          </Suspense>
          <Suspense fallback={<ChartSkeleton />}>
            <PerformanceComparisonChart />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

// Skeleton loaders
function KPICardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-6">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-32 mb-1" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

function CarouselSkeleton() {
  return (
    <div className="px-6">
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="min-w-[280px] h-[200px] rounded-xl border border-border bg-card" />
        ))}
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <Skeleton className="h-6 w-32 mb-4" />
      <Skeleton className="h-[200px] w-full" />
    </div>
  );
}
