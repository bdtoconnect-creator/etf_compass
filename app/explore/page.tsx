import { PageHeader, PageTitle, PageDescription } from "@/components/shared/page-header";
import { ETFSearch } from "@/components/explore/etf-search";
import { FilterChips } from "@/components/explore/filter-chips";
import { ETFGrid } from "@/components/explore/etf-grid";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExplorePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader>
        <PageTitle>Explore ETFs</PageTitle>
        <PageDescription>
          Discover and analyze ETFs with AI-powered insights
        </PageDescription>
      </PageHeader>

      {/* Search Bar */}
      <div className="px-6">
        <Suspense fallback={<SearchSkeleton />}>
          <ETFSearch />
        </Suspense>
      </div>

      {/* Filter Chips */}
      <div className="px-6">
        <FilterChips />
      </div>

      {/* ETF Grid */}
      <div className="px-6 pb-6">
        <Suspense fallback={<ETFGridSkeleton />}>
          <ETFGrid />
        </Suspense>
      </div>
    </div>
  );
}

function ETFGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="h-[220px] rounded-xl border border-border bg-card" />
      ))}
    </div>
  );
}

function SearchSkeleton() {
  return <Skeleton className="h-12 w-full rounded-full" />;
}
