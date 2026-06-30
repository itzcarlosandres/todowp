"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getBrandingSettings } from "./logo-actions";
import * as Icons from "lucide-react";
import Image from "next/image";

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  const { data: branding } = useQuery({
    queryKey: ["brandingSettings"],
    queryFn: () => getBrandingSettings(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (!branding) {
    // Fallback loading state (matches original layout to prevent layout shift)
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="relative flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 shadow-md shadow-brand-500/30">
          <span className="size-4 text-white"></span>
        </div>
        {showText && (
          <span className="bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-lg font-bold tracking-tight text-transparent">
            MarketFlow
          </span>
        )}
      </div>
    );
  }

  if (branding.brand_logo_type === "IMAGE" && branding.brand_logo_image) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="relative h-8 w-auto min-w-[32px]">
          <Image 
            src={branding.brand_logo_image} 
            alt={branding.brand_logo_text || "Logo"}
            fill
            className="object-contain"
          />
        </div>
        {showText && branding.brand_logo_text && (
          <span className="bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-lg font-bold tracking-tight text-transparent">
            {branding.brand_logo_text}
          </span>
        )}
      </div>
    );
  }

  const formatIconName = (name: string) => {
    return name
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join("");
  };

  const formattedIconName = formatIconName(branding.brand_logo_icon || "ShoppingBag");
  const IconComponent =
    ((Icons as unknown) as Record<string, React.ElementType>)[formattedIconName] || Icons.ShoppingBag;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 shadow-md shadow-brand-500/30">
        <IconComponent className="size-4 text-white" />
        <div className="absolute -inset-1 -z-10 rounded-lg bg-gradient-to-br from-brand-500/40 to-brand-700/0 blur-md" />
      </div>
      {showText && branding.brand_logo_text && (
        <span className="bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-lg font-bold tracking-tight text-transparent truncate">
          {branding.brand_logo_text}
        </span>
      )}
    </div>
  );
}
