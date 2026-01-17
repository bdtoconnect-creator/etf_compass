"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterChipsProps {
  tier?: 'top50' | 'all';
  onTierChange?: (tier: 'top50' | 'all') => void;
  sector?: string;
  onSectorChange?: (sector: string | undefined) => void;
}

export function FilterChips({ tier = 'top50', onTierChange, sector, onSectorChange }: FilterChipsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Tier Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full gap-1.5"
          >
            {tier === 'top50' ? 'Top 50 ETFs' : 'All 200 ETFs'}
            <ChevronDown className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => onTierChange?.('top50')}
          >
            Top 50 ETFs (Real-time)
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => onTierChange?.('all')}
          >
            All 200 ETFs (Daily)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sector Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={sector ? "default" : "outline"}
            size="sm"
            className={cn(
              "rounded-full gap-1.5",
              sector && "bg-primary text-background-dark hover:bg-primary/90"
            )}
          >
            {sector || "All Sectors"}
            <ChevronDown className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => onSectorChange?.(undefined)}
          >
            All Sectors
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => onSectorChange?.('Large Cap')}
          >
            Large Cap
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => onSectorChange?.('Technology')}
          >
            Technology
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => onSectorChange?.('Healthcare')}
          >
            Healthcare
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => onSectorChange?.('Financials')}
          >
            Financials
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => onSectorChange?.('Dividend')}
          >
            Dividend
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => onSectorChange?.('Bonds')}
          >
            Bonds
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => onSectorChange?.('Real Estate')}
          >
            Real Estate
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => onSectorChange?.('Energy')}
          >
            Energy
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => onSectorChange?.('International')}
          >
            International
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
