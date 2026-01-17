"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface TopPicksCarouselProps {
  className?: string;
}

interface CarouselItem {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  aiScore: number;
  signal: string;
  riskLevel: string;
  weeklyHistory: number[];
  weekChange: number;
  rank: number;
}

export function TopPicksCarousel({ className }: TopPicksCarouselProps) {
  const [topPicks, setTopPicks] = useState<CarouselItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch top picks from API
  useEffect(() => {
    async function fetchTopPicks() {
      try {
        const response = await fetch('/api/etf/top-picks');
        if (!response.ok) {
          throw new Error('Failed to fetch top picks');
        }
        const data = await response.json();

        // Add IDs to each item
        const itemsWithIds = data.map((item: CarouselItem) => ({
          ...item,
          id: item.symbol,
        }));

        setTopPicks(itemsWithIds);
      } catch (err) {
        console.error('Error fetching top picks:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');

        // Set mock data as fallback
        setTopPicks(getMockTopPicks());
      } finally {
        setLoading(false);
      }
    }

    fetchTopPicks();

    // Refresh every 5 minutes
    const interval = setInterval(fetchTopPicks, 300000);
    return () => clearInterval(interval);
  }, []);

  // Function to pause auto-play
  const pauseAutoPlay = useCallback(() => {
    setIsPaused(true);
    // Clear any existing timer
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
    }
    // Resume auto-play after 5 seconds of no interaction
    pauseTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 5000);
  }, []);

  // Auto-play
  useEffect(() => {
    if (isPaused || loading || topPicks.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % topPicks.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, loading, topPicks.length]);

  // Touch & Mouse handling for swipe/drag
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    // Pause auto-play when user starts touching
    pauseAutoPlay();
    setTouchEnd(0);
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientX);
    // Prevent page scroll only if horizontal swipe is detected
    const currentX = e.touches[0].clientX;
    const diff = Math.abs(currentX - touchStart);
    if (diff > 10) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || topPicks.length === 0) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) setCurrentIndex((prev) => (prev + 1) % topPicks.length);
    else if (distance < -50) setCurrentIndex((prev) => (prev - 1 + topPicks.length) % topPicks.length);
    setTouchStart(0);
    setTouchEnd(0);
  };

  // Mouse drag support for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    pauseAutoPlay();
    setIsDragging(true);
    setTouchEnd(0);
    setTouchStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTouchEnd(e.clientX);
  };

  const handleMouseUp = () => {
    if (!isDragging || topPicks.length === 0) return;
    setIsDragging(false);
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) setCurrentIndex((prev) => (prev + 1) % topPicks.length);
    else if (distance < -50) setCurrentIndex((prev) => (prev - 1 + topPicks.length) % topPicks.length);
    setTouchStart(0);
    setTouchEnd(0);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setTouchStart(0);
      setTouchEnd(0);
    }
  };

  // Handle arrow button clicks - also pause auto-play
  const handleArrowClick = (direction: 'prev' | 'next') => {
    pauseAutoPlay();
    if (topPicks.length === 0) return;

    if (direction === 'prev') {
      setCurrentIndex((prev) => (prev - 1 + topPicks.length) % topPicks.length);
    } else {
      setCurrentIndex((prev) => (prev + 1) % topPicks.length);
    }
  };

  // Generate chart path
  const generateChart = (data: number[]) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => {
      const x = 20 + (index / (data.length - 1)) * 240;
      const y = 70 - ((value - min) / range) * 50;
      return { x, y };
    });

    let pathD = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      pathD += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }

    return {
      line: pathD,
      area: `${pathD} L 260,70 L 20,70 Z`,
      points,
    };
  };

  // Build cards array
  const buildCards = () => {
    if (topPicks.length === 0) return [];

    const result = [];
    const total = topPicks.length;

    for (let i = -2; i <= 2; i++) {
      const index = (currentIndex + i + total) % total;
      const offset = i;
      const isCenter = offset === 0;
      const absOffset = Math.abs(offset);

      // Enhanced 3D Cover Flow calculations - adjusted for 5 visible cards
      const rotateY = offset * -40;
      const rotateX = 0;
      const translateX = offset * 160;
      const translateZ = -absOffset * 100;
      const scale = isCenter ? 1 : absOffset === 1 ? 0.9 : 0.8;
      const zIndex = 100 - absOffset * 10;
      const opacity = isCenter ? 1 : absOffset === 1 ? 0.95 : 0.7;

      result.push({
        ...topPicks[index],
        offset,
        isCenter,
        absOffset,
        rotateY,
        rotateX,
        translateX,
        translateZ,
        scale,
        zIndex,
        opacity,
      });
    }

    return result;
  };

  const cards = buildCards();

  if (loading) {
    return (
      <div className={cn("relative select-none px-2 sm:px-4 isolate", className)}>
        <div className="relative max-w-5xl mx-auto w-full">
          <div className="relative h-[340px] sm:h-[380px] md:h-[440px] flex items-center justify-center">
            <div className="text-center text-muted-foreground">Loading top picks...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error && topPicks.length === 0) {
    return (
      <div className={cn("relative select-none px-2 sm:px-4 isolate", className)}>
        <div className="relative max-w-5xl mx-auto w-full">
          <div className="relative h-[340px] sm:h-[380px] md:h-[440px] flex items-center justify-center">
            <div className="text-center text-destructive">Failed to load top picks</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("relative select-none px-2 sm:px-4 isolate", className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 3D Carousel with side arrows */}
      <div className="relative max-w-5xl mx-auto w-full">
        {/* Carousel */}
        <div
          ref={carouselRef}
          className="relative h-[340px] sm:h-[380px] md:h-[440px] flex items-center justify-center touch-pan-x"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          {/* Left Arrow - positioned at the left edge of carousel container */}
          <button
            onClick={() => handleArrowClick('prev')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-50 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 border-2 shadow-lg"
            style={{
              backgroundColor: "rgb(22, 29, 28)",
              borderColor: "rgb(45, 210, 183)",
              color: "rgb(45, 210, 183)",
            }}
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div
            className="relative w-full h-full flex items-center justify-center"
            style={{
              perspective: "2500px",
              perspectiveOrigin: "50% 45%",
            }}
          >
            {cards.map((card, index) => {
              const originalIndex = topPicks.findIndex(p => p.id === card.id);

              return (
                <div
                  key={card.id}
                  className="absolute carousel-card-3d"
                  style={{
                    transform: `translateX(${card.translateX}px) translateZ(${card.translateZ}px) rotateY(${card.rotateY}deg) rotateX(${card.rotateX}deg) scale3d(${card.scale},${card.scale},${card.scale})`,
                    opacity: card.opacity,
                    zIndex: card.zIndex,
                    width: 320,
                    height: 420,
                    transformOrigin: "center center",
                    transformStyle: "preserve-3d",
                    backfaceVisibility: "hidden",
                    pointerEvents: card.isCenter ? "auto" : "none",
                  }}
                >
                  <Link
                    href={`/deep-dive/${card.symbol}`}
                    className="block w-full h-full"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {/* Card Container */}
                    <div
                      className="w-full h-full rounded-2xl border-2 overflow-hidden flex flex-col relative"
                      style={{
                        backgroundColor: "rgb(22, 29, 28)",
                        borderColor: card.isCenter
                          ? "rgb(45, 210, 183)"
                          : `rgba(45, 210, 183, ${0.15 - card.absOffset * 0.03})`,
                        boxShadow: card.isCenter
                          ? `0 35px 70px rgba(45, 210, 183, 0.35), 0 0 0 1px rgba(45, 210, 183, 0.3) inset, 0 0 40px rgba(45, 210, 183, 0.2)`
                          : `0 25px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05) inset, 0 ${card.offset > 0 ? '' : '-'}15px 30px rgba(0,0,0,0.4)`,
                        transform: "translateZ(0)",
                      }}
                    >
                      {/* Content */}
                      <div className="p-5 h-full flex flex-col relative z-10">
                        {/* Badges */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex flex-col gap-1.5">
                            <span
                              className="inline-block text-[10px] font-bold py-1 px-3 rounded-full shadow-lg"
                              style={{
                                backgroundColor: card.signal === "buy" || card.signal === "Strong Buy" || card.signal === "Outperform"
                                  ? "#2dd2b7"
                                  : card.signal === "hold" || card.signal === "Hold"
                                  ? "#f59e0b"
                                  : "#ef4444",
                                color: card.signal === "hold" || card.signal === "Hold" ? "#fff" : "#0a0f0e",
                              }}
                            >
                              {card.signal}
                            </span>
                            <span className="inline-block text-[9px] font-medium py-0.5 px-2 rounded border" style={{
                              backgroundColor: "rgba(45, 210, 183, 0.15)",
                              borderColor: "rgba(45, 210, 183, 0.3)",
                              color: "rgb(160, 182, 178)"
                            }}>
                              {card.riskLevel === 'low' ? 'Low Risk' : card.riskLevel === 'medium' ? 'Med Risk' : 'High Risk'}
                            </span>
                          </div>
                        </div>

                        {/* ETF Info */}
                        <div className="mb-3">
                          <div className="flex items-baseline justify-between mb-1">
                            <div>
                              <p className={cn("font-bold leading-none text-white", card.isCenter ? "text-lg" : "text-base")}>
                                {card.symbol}
                              </p>
                              <p className={cn("font-medium mt-0.5 text-gray-300", card.isCenter ? "text-base" : "text-sm")}>
                                ${card.price.toFixed(2)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[9px] text-gray-400 uppercase tracking-wide">Weekly</p>
                              <p
                                className={cn("text-sm font-bold leading-none", card.weekChange >= 0 ? "text-[#2dd2b7]" : "text-red-400")}
                              >
                                {card.weekChange >= 0 ? "+" : ""}{card.weekChange.toFixed(2)}%
                              </p>
                            </div>
                          </div>
                          <p className={cn("text-gray-400 leading-tight", card.isCenter ? "text-xs" : "text-[10px]")}>
                            {card.name}
                          </p>
                        </div>

                        {/* Chart */}
                        <div className="flex-1 flex flex-col min-h-0">
                          <p className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold mb-2">
                            Weekly Performance
                          </p>
                          <div className="flex-1 relative rounded-lg overflow-hidden" style={{ background: "rgba(0, 0, 0, 0.2)" }}>
                            <svg
                              viewBox="0 0 280 80"
                              className="w-full h-full"
                              preserveAspectRatio="none"
                            >
                              <defs>
                                <linearGradient id={`grad-${card.symbol}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#2dd2b7" stopOpacity={0.6} />
                                  <stop offset="100%" stopColor="#2dd2b7" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <path
                                d={generateChart(card.weeklyHistory).area}
                                fill={`url(#grad-${card.symbol})`}
                              />
                              <path
                                d={generateChart(card.weeklyHistory).line}
                                fill="none"
                                stroke="#2dd2b7"
                                strokeWidth={card.isCenter ? 2.5 : 2}
                                strokeLinecap="round"
                              />
                              {card.isCenter && generateChart(card.weeklyHistory).points.map((point, i) => (
                                <g key={i}>
                                  <circle
                                    cx={point.x}
                                    cy={point.y}
                                    r="4"
                                    fill="#2dd2b7"
                                    className="animate-pulse"
                                    style={{ animationDelay: `${i * 150}ms` }}
                                  />
                                  <circle
                                    cx={point.x}
                                    cy={point.y}
                                    r="8"
                                    fill="#2dd2b7"
                                    opacity={0.25}
                                    className="animate-pulse"
                                    style={{ animationDelay: `${i * 150}ms` }}
                                  />
                                </g>
                              ))}
                            </svg>
                          </div>
                        </div>

                        {/* AI Score & Rank */}
                        <div className="flex items-center justify-between pt-3 mt-auto" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Rank</p>
                            <p
                              className={cn(
                                "font-bold leading-none mt-1",
                                card.isCenter ? "text-2xl" : "text-xl",
                                card.rank <= 3 ? "text-[#2dd2b7]" : card.rank <= 6 ? "text-amber-400" : "text-gray-300"
                              )}
                            >
                              #{card.rank}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide">AI Score</p>
                            <p
                              className={cn(
                                "font-bold leading-none mt-1",
                                card.isCenter ? "text-2xl" : "text-xl",
                                card.aiScore >= 75 ? "text-[#2dd2b7]" : card.aiScore >= 60 ? "text-amber-400" : "text-red-400"
                              )}
                            >
                              {card.aiScore}
                            </p>
                          </div>
                        </div>

                        {card.isCenter && (
                          <button
                            className="h-8 px-5 text-xs font-semibold rounded-full transition-all hover:scale-105 active:scale-95"
                            style={{
                              backgroundColor: "#2dd2b7",
                              color: "#0a0f0e",
                              boxShadow: "0 4px 12px rgba(45, 210, 183, 0.4)",
                            }}
                          >
                            View Analysis
                          </button>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Right Arrow - positioned at the right edge of carousel container */}
          <button
            onClick={() => handleArrowClick('next')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-50 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 border-2 shadow-lg"
            style={{
              backgroundColor: "rgb(22, 29, 28)",
              borderColor: "rgb(45, 210, 183)",
              color: "rgb(45, 210, 183)",
            }}
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Navigation & Controls - Centered */}
      <div className="flex flex-col items-center gap-4 mt-6">
        {/* Pagination Dots */}
        <div className="flex gap-2">
          {topPicks.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                pauseAutoPlay();
                setCurrentIndex(index);
              }}
              className={cn(
                "h-2 rounded-full transition-all duration-500",
                index === currentIndex ? "w-10" : "w-2"
              )}
              style={{
                backgroundColor: index === currentIndex ? "rgb(45, 210, 183)" : "rgb(51, 65, 85)",
                boxShadow: index === currentIndex ? "0 0 12px rgba(45, 210, 183, 0.6)" : "none",
              }}
            />
          ))}
        </div>

        {/* Status */}
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all",
            isPaused
              ? "border-gray-600"
              : "border-[rgba(45,210,183,0.3)]"
          )}
          style={{
            backgroundColor: isPaused ? "rgba(255,255,255,0.05)" : "rgba(45,210,183,0.1)",
          }}
        >
          <div className={cn(
            "w-1.5 h-1.5 rounded-full",
            isPaused ? "bg-gray-500" : "bg-[#2dd2b7]"
          )} />
          <p className="text-[11px] font-medium text-gray-400">
            {isPaused ? "Paused" : "Auto"}
          </p>
        </div>
      </div>
    </div>
  );
}

// Mock data as fallback
function getMockTopPicks(): CarouselItem[] {
  return [
    {
      id: "1",
      symbol: "VOO",
      name: "Vanguard S&P 500",
      price: 428.12,
      change: 1.24,
      aiScore: 92,
      signal: "Strong Buy",
      riskLevel: "low",
      weeklyHistory: [418.50, 422.30, 420.80, 425.40, 423.90, 426.50, 428.12],
      weekChange: 2.31,
      rank: 1,
    },
    {
      id: "2",
      symbol: "QQQ",
      name: "Invesco QQQ Trust",
      price: 384.45,
      change: 2.15,
      aiScore: 89,
      signal: "Strong Buy",
      riskLevel: "medium",
      weeklyHistory: [375.20, 378.40, 380.10, 376.80, 382.40, 379.30, 384.45],
      weekChange: 2.46,
      rank: 2,
    },
    {
      id: "3",
      symbol: "SCHD",
      name: "Schwab US Dividend",
      price: 74.18,
      change: 0.88,
      aiScore: 85,
      signal: "buy",
      riskLevel: "low",
      weeklyHistory: [72.30, 73.10, 72.55, 73.60, 73.20, 74.10, 74.18],
      weekChange: 2.60,
      rank: 3,
    },
    {
      id: "4",
      symbol: "VTI",
      name: "Vanguard Total Market",
      price: 252.34,
      change: 0.95,
      aiScore: 82,
      signal: "buy",
      riskLevel: "low",
      weeklyHistory: [248.40, 249.20, 247.80, 250.30, 249.60, 251.40, 252.34],
      weekChange: 1.58,
      rank: 4,
    },
    {
      id: "5",
      symbol: "VGT",
      name: "Vanguard Info Tech",
      price: 462.84,
      change: 1.14,
      aiScore: 79,
      signal: "buy",
      riskLevel: "high",
      weeklyHistory: [455.80, 458.40, 456.90, 460.50, 458.80, 462.40, 462.84],
      weekChange: 1.55,
      rank: 5,
    },
  ];
}
