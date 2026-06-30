"use client";

import { useState, useEffect } from "react";
import { Zap, Gift, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  text: string;
  subtext?: string;
  countdown?: string;
  buttonText?: string;
  buttonLink?: string;
}

export function TopBar({ text, subtext, countdown, buttonText, buttonLink }: TopBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const isDismissed = localStorage.getItem("promo_bar_dismissed");
    if (!isDismissed) {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!countdown) return;

    const target = new Date(countdown).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance < 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown]);

  if (!isClient || !isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("promo_bar_dismissed", "true");
  };

  const pad = (num: number) => String(num).padStart(2, "0");

  return (
    <div className="relative flex w-full items-center justify-between bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-white sm:px-6 lg:px-8 shadow-sm">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
         <div className="absolute -left-4 -top-12 size-40 rounded-full bg-white/20 blur-2xl"></div>
         <div className="absolute -right-4 -bottom-12 size-40 rounded-full bg-white/20 blur-2xl"></div>
      </div>
      
      <div className="mx-auto flex flex-col items-center justify-center gap-x-6 gap-y-2 text-center sm:flex-row lg:gap-x-8 z-10 pr-6">
        
        {/* Tag */}
        <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-amber-950 uppercase tracking-wider shadow-sm">
          <Zap className="size-3.5 fill-current" />
          LIMITED OFFER
        </div>

        {/* Text */}
        <div className="flex flex-col items-center gap-1 sm:flex-row sm:gap-3 text-sm font-medium">
          <div className="flex items-center gap-2">
            <Gift className="size-4 text-amber-300" />
            <span>{text}</span>
          </div>
          {subtext && (
            <>
              <span className="hidden sm:inline text-white/50">|</span>
              <span className="text-white/90">{subtext}</span>
            </>
          )}
        </div>

        {/* Countdown */}
        {countdown && new Date(countdown).getTime() > new Date().getTime() && (
          <div className="flex items-center gap-2 text-sm font-semibold tracking-wide">
            <span className="text-white/80 font-normal mr-1">Ends in:</span>
            {timeLeft.days > 0 && (
              <>
                <div className="flex items-center justify-center rounded bg-black/25 px-2 py-1 min-w-[32px] shadow-inner">{pad(timeLeft.days)}</div>
                <span className="opacity-70">:</span>
              </>
            )}
            <div className="flex items-center justify-center rounded bg-black/25 px-2 py-1 min-w-[32px] shadow-inner">{pad(timeLeft.hours)}</div>
            <span className="opacity-70">:</span>
            <div className="flex items-center justify-center rounded bg-black/25 px-2 py-1 min-w-[32px] shadow-inner">{pad(timeLeft.minutes)}</div>
            <span className="opacity-70">:</span>
            <div className="flex items-center justify-center rounded bg-black/25 px-2 py-1 min-w-[32px] shadow-inner">{pad(timeLeft.seconds)}</div>
          </div>
        )}

        {/* Action Button */}
        {buttonText && buttonLink && (
          <Button 
            variant="secondary" 
            size="sm" 
            className="h-8 shrink-0 bg-amber-400 text-amber-950 hover:bg-amber-500 hover:text-amber-950 font-bold border-none shadow-sm transition-transform hover:scale-105 active:scale-95" 
            asChild
          >
            <Link href={buttonLink}>
              {buttonText} &rarr;
            </Link>
          </Button>
        )}
      </div>

      <button
        onClick={handleDismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-white/60 hover:text-white transition-colors focus:outline-none z-10 hover:bg-white/10 rounded-full"
        aria-label="Dismiss"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
