import { PageHeader, PageTitle, PageDescription } from "@/components/shared/page-header";
import { PortfolioHero } from "@/components/portfolio/portfolio-hero";
import { HoldingsTable } from "@/components/portfolio/holdings-table";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PortfolioPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader>
        <PageTitle>Portfolio</PageTitle>
        <PageDescription>
          Track your holdings and AI recommendations
        </PageDescription>
      </PageHeader>

      {/* Portfolio Hero with Total Assets */}
      <div className="px-6">
        <Suspense fallback={<PortfolioHeroSkeleton />}>
          <PortfolioHero />
        </Suspense>
      </div>

      {/* Holdings Table */}
      <div className="px-6 pb-6">
        <Suspense fallback={<HoldingsTableSkeleton />}>
          <HoldingsTable />
        </Suspense>
      </div>
    </div>
  );
}

function PortfolioHeroSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-8">
      <div className="flex flex-col items-center gap-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-6 w-32" />
      </div>
    </div>
  );
}

function HoldingsTableSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-24 rounded-xl border border-border bg-card" />
      ))}
    </div>
  );
}
