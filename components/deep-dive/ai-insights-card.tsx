"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ChevronRight } from "lucide-react";

export function AIInsightsCard({ symbol }: { symbol: string }) {
  // Mock data - will be fetched from API
  const aiData = {
    signal: "Bullish",
    confidence: "High",
    explanation:
      "Proprietary models indicate strong momentum in cloud computing and semiconductor sectors. Volatility remains within the expected ±2.4% band for the upcoming week. Recommend accumulating on minor pullbacks.",
  };

  return (
    <Card className="relative overflow-hidden rounded-xl border border-primary/30 bg-primary/5">
      <div className="flex items-start gap-4 p-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
          <Sparkles className="size-5" />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-foreground text-base font-bold">AI Signal: {aiData.signal}</h3>
            <Badge className="bg-primary/20 text-primary border-primary/30">
              {aiData.confidence} Confidence
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {aiData.explanation}
          </p>
          <Button variant="link" className="mt-3 p-0 h-auto text-primary gap-1">
            Detailed AI Report
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
