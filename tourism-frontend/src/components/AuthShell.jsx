import React, { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const AuthShell = ({
  eyebrow,
  title,
  description,
  visuals = [],
  children,
  cardClassName,
  contentClassName,
}) => {
  const [activeVisual, setActiveVisual] = useState(0);

  useEffect(() => {
    if (visuals.length < 2) return undefined;

    const interval = setInterval(() => {
      setActiveVisual((current) => (current + 1) % visuals.length);
    }, 5200);

    return () => clearInterval(interval);
  }, [visuals.length]);

  return (
    <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.12fr_0.88fr]">
      <section className="woven-surface relative overflow-hidden rounded-[2.25rem] border border-white/45 bg-[linear-gradient(145deg,rgba(20,60,47,0.97),rgba(37,78,62,0.93)_48%,rgba(140,72,28,0.92))] p-6 text-white shadow-[0_32px_100px_-45px_rgba(16,34,25,0.8)] sm:p-8 lg:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,202,113,0.26),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.18),transparent_30%)]" />
        <div className="relative z-10 flex h-full flex-col justify-between gap-8">
          <div className="space-y-5">
            <Badge variant="gold" className="bg-white/12 text-amber-100 border-white/15">
              {eyebrow}
            </Badge>
            <div className="space-y-4">
              <h1 className="max-w-2xl font-heading text-4xl leading-tight sm:text-5xl">{title}</h1>
              <p className="max-w-xl text-base leading-8 text-white/78 sm:text-lg">{description}</p>
            </div>
          </div>

          {visuals.length > 0 && (
            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="relative min-h-[320px] overflow-hidden rounded-[1.9rem] border border-white/15 bg-black/15 shadow-2xl">
                {visuals.map((visual, index) => (
                  <div
                    key={`${visual.title}-${index}`}
                    className={cn(
                      "absolute inset-0 transition-all duration-700 ease-out",
                      index === activeVisual ? "scale-100 opacity-100" : "scale-105 opacity-0",
                    )}
                  >
                    <img
                      alt={visual.title}
                      className={cn(
                        "h-full w-full object-cover saturate-[1.05]",
                        index === activeVisual && "animate-pan-slow",
                      )}
                      src={visual.image}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  </div>
                ))}

                <div className="absolute inset-x-0 bottom-0 z-10 space-y-3 px-5 py-5 sm:px-6">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-amber-200">
                    {visuals[activeVisual]?.label}
                  </p>
                  <div>
                    <h2 className="font-heading text-3xl leading-tight text-white">
                      {visuals[activeVisual]?.title}
                    </h2>
                    <p className="mt-2 max-w-lg text-sm leading-6 text-white/80">
                      {visuals[activeVisual]?.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid content-start gap-3">
                {visuals.map((visual, index) => (
                  <button
                    key={`${visual.label}-${index}`}
                    type="button"
                    onClick={() => setActiveVisual(index)}
                    className={cn(
                      "rounded-[1.5rem] border px-4 py-4 text-left transition-all duration-300",
                      index === activeVisual
                        ? "border-white/30 bg-white/13 shadow-lg"
                        : "border-white/10 bg-white/[0.06] hover:border-white/20 hover:bg-white/[0.1]",
                    )}
                  >
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-amber-100/90">
                      {visual.label}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">{visual.title}</p>
                    <p className="mt-2 text-sm leading-6 text-white/70">{visual.snippet || visual.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Card className={cn("overflow-hidden border-white/70 bg-[rgba(255,251,244,0.92)]", cardClassName)}>
        <div className="h-1 w-full bg-[linear-gradient(90deg,#1f5c46_0%,#e0b964_52%,#a64b22_100%)]" />
        <CardContent className={cn("p-6 sm:p-8 lg:p-9", contentClassName)}>{children}</CardContent>
      </Card>
    </div>
  );
};

export default AuthShell;
