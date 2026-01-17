import { PageHeader, PageTitle, PageDescription } from "@/components/shared/page-header";

export default function InsightsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader>
        <PageTitle>Insights</PageTitle>
        <PageDescription>
          Market analysis and AI-powered recommendations
        </PageDescription>
      </PageHeader>

      <div className="px-6 text-center py-20">
        <div className="max-w-md mx-auto">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center size-16 rounded-full bg-primary/20 text-primary">
              <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
          <p className="text-sm text-muted-foreground">
            Advanced market insights, sector analysis, and personalized recommendations will be available here.
          </p>
        </div>
      </div>
    </div>
  );
}
