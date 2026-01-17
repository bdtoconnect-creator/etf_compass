"use client";

export function ETFPriceHero({ symbol }: { symbol: string }) {
  // Mock data - will be fetched from API
  const data = {
    name: "Vanguard Info Tech ETF",
    price: 462.84,
    change: 5.20,
    changePercent: 1.14,
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">
        {data.name}
      </p>
      <div className="flex items-baseline gap-3 mt-1">
        <span className="text-5xl font-bold tracking-tighter">${data.price.toFixed(2)}</span>
        <span className="text-primary font-semibold text-lg flex items-center">
          +{data.changePercent}%
        </span>
      </div>
      <p className="text-sm text-muted-foreground mt-1">
        +${data.change.toFixed(2)} Today • Open 9:30 AM EST
      </p>
    </div>
  );
}
