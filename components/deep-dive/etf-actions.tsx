"use client";

import { Button } from "@/components/ui/button";

export function ETFActions() {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-10 z-10">
      <div className="flex gap-3 max-w-2xl mx-auto">
        <Button
          variant="outline"
          className="flex-1 h-12 rounded-full border-border/50 hover:bg-accent"
        >
          Add to Watchlist
        </Button>
        <Button className="flex-[1.5] h-12 rounded-full bg-primary text-background-dark hover:bg-primary/90 shadow-lg shadow-primary/30">
          Trade Now
        </Button>
      </div>
    </div>
  );
}
