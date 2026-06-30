"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
}

const sizeMap = {
  sm: "size-5",
  md: "size-7",
  lg: "size-8",
};

export function StarRatingInput({
  value,
  onChange,
  max = 5,
  size = "lg",
  disabled = false,
  className,
}: StarRatingInputProps) {
  const [hoverValue, setHoverValue] = React.useState(0);
  const iconSize = sizeMap[size];

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      role="radiogroup"
      aria-label="Calificación"
    >
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= (hoverValue || value);

        return (
          <span
            key={i}
            role="radio"
            aria-checked={value === starValue}
            aria-label={`${starValue} estrella${starValue > 1 ? "s" : ""}`}
            tabIndex={disabled ? -1 : 0}
            className={cn(
              "rounded p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              disabled && "cursor-not-allowed opacity-50",
            )}
            onMouseEnter={() => setHoverValue(starValue)}
            onMouseLeave={() => setHoverValue(0)}
            onClick={() => !disabled && onChange(starValue)}
            onKeyDown={(e) => {
              if (disabled) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onChange(starValue);
              }
            }}
          >
            <Star
              className={cn(
                iconSize,
                "transition-colors",
                isFilled
                  ? "fill-warning stroke-warning"
                  : "fill-transparent stroke-muted-foreground/40",
              )}
            />
          </span>
        );
      })}
    </div>
  );
}
