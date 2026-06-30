"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "xs" | "sm" | "md" | "lg";
  showValue?: boolean;
  count?: number;
  className?: string;
}

const sizeMap = {
  xs: "size-3",
  sm: "size-3.5",
  md: "size-4",
  lg: "size-5",
};

export function StarRating({
  rating,
  max = 5,
  size = "sm",
  showValue = false,
  count,
  className,
}: StarRatingProps) {
  const filled = Math.floor(rating);
  const half = rating - filled >= 0.5;
  const iconSize = sizeMap[size];

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {Array.from({ length: max }, (_, i) => {
          const isFilled = i < filled;
          const isHalf = i === filled && half;
          return (
            <Star
              key={i}
              className={cn(
                iconSize,
                isFilled || isHalf
                  ? "fill-warning stroke-warning"
                  : "fill-transparent stroke-muted-foreground/40",
              )}
            />
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-medium tabular-nums">
          {rating.toFixed(1)}
        </span>
      )}
      {typeof count === "number" && (
        <span className="text-xs text-muted-foreground">({count})</span>
      )}
    </div>
  );
}
