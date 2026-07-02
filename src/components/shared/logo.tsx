"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getBrandingSettings } from "./logo-actions";
import * as Icons from "lucide-react";
import Image from "next/image";

const sizeClasses: Record<string, string> = {
  sm: "size-6",
  md: "size-8",
  lg: "size-10",
  xl: "size-12",
};

const iconSizeClasses: Record<string, string> = {
  sm: "size-3",
  md: "size-4",
  lg: "size-5",
  xl: "size-6",
};

const textSizeClasses: Record<string, string> = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
  xl: "text-2xl",
  "2xl": "text-3xl",
  "3xl": "text-4xl",
};

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  const { data: branding } = useQuery({
    queryKey: ["brandingSettings"],
    queryFn: () => getBrandingSettings(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (!branding) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="relative flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 shadow-md shadow-brand-500/30">
          <span className="size-4 text-white"></span>
        </div>
        {showText && (
          <span className="font-[family-name:var(--font-bricolage)] bg-gradient-to-r from-foreground via-brand-500 to-foreground bg-clip-text text-lg font-bold tracking-tight text-transparent bg-[length:200%_100%] animate-[shimmerText_3s_ease-in-out_infinite]">
            TodoWP
          </span>
        )}
      </div>
    );
  }

  const size = branding.brand_logo_size || "md";
  const textSize = branding.brand_logo_text_size || "lg";
  const colorFrom = branding.brand_logo_color_from || "#7c3aed";
  const colorTo = branding.brand_logo_color_to || "#a78bfa";
  const iconColor = branding.brand_logo_icon_color || "#ffffff";
  const textColorFrom = branding.brand_logo_text_color_from || "#1a1a2e";
  const textColorTo = branding.brand_logo_text_color_to || "#7c3aed";
  const bgStyle = branding.brand_logo_bg_style || "gradient";

  const iconBg =
    bgStyle === "gradient"
      ? `linear-gradient(135deg, ${colorFrom}, ${colorTo})`
      : bgStyle === "solid"
        ? colorFrom
        : "transparent";
  const iconBorder = bgStyle === "outline" ? `2px solid ${colorFrom}` : "none";

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
          <span
            className={cn(
              "font-[family-name:var(--font-bricolage)] font-bold tracking-tight bg-[length:200%_100%] animate-[shimmerText_3s_ease-in-out_infinite]",
              textSizeClasses[textSize] || "text-lg",
            )}
            style={{
              backgroundImage: `linear-gradient(90deg, ${textColorFrom}, ${textColorTo})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
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
    <div className={cn("group flex items-center gap-2", className)}>
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center rounded-lg shadow-md",
          sizeClasses[size] || "size-8",
        )}
        style={{ background: iconBg, border: iconBorder }}
      >
        <IconComponent
          className={cn(iconSizeClasses[size] || "size-4")}
          style={{ color: iconColor }}
        />
      </div>
      {showText && branding.brand_logo_text && (
        <span
          className={cn(
            "font-[family-name:var(--font-bricolage)] font-bold tracking-tight bg-[length:200%_100%] animate-[shimmerText_3s_ease-in-out_infinite]",
            textSizeClasses[textSize] || "text-lg",
          )}
          style={{
            backgroundImage: `linear-gradient(90deg, ${textColorFrom}, ${textColorTo})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {branding.brand_logo_text}
        </span>
      )}
    </div>
  );
}
