"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface ETFSearchProps {
  onSearch?: (query: string) => void;
}

export function ETFSearch({ onSearch }: ETFSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(value.trim());
  };

  const handleClear = () => {
    setValue("");
    onSearch?.("");
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search tickers or sectors..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-12 pl-12 pr-24 rounded-full bg-card border-border focus:border-primary"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="h-8 w-8 rounded-full"
            >
              <X className="size-4" />
            </Button>
          )}
          <Button
            type="submit"
            size="default"
            className="h-8 rounded-full bg-primary text-background-dark hover:bg-primary/90"
          >
            Search
          </Button>
        </div>
      </div>
    </form>
  );
}
