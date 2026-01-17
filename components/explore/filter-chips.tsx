"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export function FilterChips() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = [
    { id: "all", label: "All ETFs" },
    { id: "sector", label: "Sector" },
    { id: "risk", label: "Risk" },
    { id: "ai-rating", label: "AI Rating" },
  ];

  const sectors = ["Technology", "Healthcare", "Finance", "Energy", "Consumer"];
  const risks = ["Low", "Medium", "High"];
  const aiRatings = ["Strong Buy (85+)", "Buy (70-84)", "Hold (50-69)", "Sell (<50)"];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.id;

        if (filter.id === "all") {
          return (
            <Button
              key={filter.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                "rounded-full",
                isActive && "bg-primary text-background-dark hover:bg-primary/90 shadow-lg shadow-primary/20"
              )}
            >
              {filter.label}
            </Button>
          );
        }

        return (
          <DropdownMenu key={filter.id}>
            <DropdownMenuTrigger asChild>
              <Button
                variant={isActive ? "default" : "outline"}
                size="sm"
                className={cn(
                  "rounded-full gap-1.5",
                  isActive && "bg-primary text-background-dark hover:bg-primary/90"
                )}
              >
                {filter.label}
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {filter.id === "sector" &&
                sectors.map((sector) => (
                  <DropdownMenuItem key={sector} className="cursor-pointer">
                    {sector}
                  </DropdownMenuItem>
                ))}
              {filter.id === "risk" &&
                risks.map((risk) => (
                  <DropdownMenuItem key={risk} className="cursor-pointer">
                    {risk} Risk
                  </DropdownMenuItem>
                ))}
              {filter.id === "ai-rating" &&
                aiRatings.map((rating) => (
                  <DropdownMenuItem key={rating} className="cursor-pointer">
                    {rating}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      })}
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}
