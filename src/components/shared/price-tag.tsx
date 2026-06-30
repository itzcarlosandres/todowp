import * as React from "react";
import { cn } from "@/lib/utils";
import { formatPrice, discountPercent } from "@/lib/format";

interface PriceTagProps {
  price: number | string;
  salePrice?: number | string | null;
  currency?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  locale?: string;
}

const sizes = {
  sm: { current: "text-sm", old: "text-xs" },
  md: { current: "text-base", old: "text-xs" },
  lg: { current: "text-2xl", old: "text-sm" },
  xl: { current: "text-3xl", old: "text-base" },
};

export function PriceTag({
  price,
  salePrice,
  currency = "USD",
  size = "md",
  className,
  locale,
}: PriceTagProps) {
  const hasSale = salePrice != null && Number(salePrice) < Number(price);
  const percent = hasSale ? discountPercent(Number(price), Number(salePrice)) : 0;
  const s = sizes[size];

  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span
        className={cn(
          "font-bold tabular-nums tracking-tight",
          s.current,
          hasSale && "text-success",
        )}
      >
        {formatPrice(hasSale ? salePrice : price, { currency, locale })}
      </span>
      {hasSale && (
        <>
          <span className={cn("text-muted-foreground line-through tabular-nums", s.old)}>
            {formatPrice(price, { currency, locale })}
          </span>
          {percent > 0 && (
            <span className="rounded-md bg-success/10 px-1.5 py-0.5 text-xs font-semibold text-success">
              -{percent}%
            </span>
          )}
        </>
      )}
    </div>
  );
}
