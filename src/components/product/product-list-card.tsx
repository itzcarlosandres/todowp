import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCompactNumber, discountPercent, formatPrice } from "@/lib/format";
import type { ProductListItem } from "@/modules/products";

const TYPE_COLORS: Record<string, string> = {
  THEME: "border-brand-500/20 text-brand-400 bg-brand-500/5",
  PLUGIN: "border-emerald-500/20 text-emerald-400 bg-emerald-500/5",
  SCRIPT: "border-cyan-500/20 text-cyan-400 bg-cyan-500/5",
  TEMPLATE: "border-amber-500/20 text-amber-400 bg-amber-500/5",
  SAAS: "border-violet-500/20 text-violet-400 bg-violet-500/5",
  LICENSE: "border-slate-500/20 text-slate-400 bg-slate-500/5",
};

const TYPE_LABELS: Record<string, string> = {
  THEME: "Theme", PLUGIN: "Plugin", SCRIPT: "Script", TEMPLATE: "Template",
  SAAS: "SaaS", LICENSE: "Licencia", GIFT_CARD: "Gift Card", ICON_PACK: "Iconos",
  GRAPHICS: "Gráficos", EMAIL_TEMPLATE: "Email", LANDING_PAGE: "Landing",
  MOBILE_APP: "App", OTHER: "Otro",
};

const RANK_COLORS = ["text-amber-400", "text-slate-300", "text-amber-700", "text-brand-400", "text-brand-400"];

interface ProductListCardProps {
  product: ProductListItem;
  rank: number;
}

export function ProductListCard({ product, rank }: ProductListCardProps) {
  const price = Number(product.price);
  const salePrice = product.salePrice != null ? Number(product.salePrice) : null;
  const hasSale = salePrice != null && salePrice < price;
  const discount = hasSale ? discountPercent(price, salePrice!) : 0;
  const typeTag = product.type ? (TYPE_LABELS[product.type] ?? product.type) : null;
  const typeColor = product.type ? (TYPE_COLORS[product.type] ?? TYPE_COLORS.THEME) : TYPE_COLORS.THEME;

  return (
    <Link href={`/product/${product.slug}`} className="group relative flex items-center gap-3 overflow-hidden rounded-xl border border-border/40 bg-card px-3.5 py-3 transition-all duration-200 hover:-translate-x-0.5 hover:border-brand-500/20 hover:bg-accent/30 hover:shadow-lg hover:shadow-black/10 block">
      <div className="absolute bottom-0 left-0 top-0 w-[3px] bg-transparent transition-colors group-hover:bg-brand-500" />

      <span className={cn("w-7 shrink-0 text-center text-xs font-extrabold tabular-nums", RANK_COLORS[rank] ?? "text-muted-foreground")}>
        {String(rank + 1).padStart(2, "0")}
      </span>

      <Image
        src={product.coverImage || "/placeholder-product.svg"}
        alt={product.title}
        width={52}
        height={52}
        className="size-[52px] shrink-0 rounded-lg border border-border/30 object-cover"
        sizes="52px"
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground group-hover:text-brand-500 transition-colors">{product.title}</p>
        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          {typeTag && (
            <span className={cn("rounded border px-1 py-px text-[10px] font-semibold", typeColor)}>
              {typeTag}
            </span>
          )}
          {product.brand && (
            <>
              <span className="inline-block size-0.5 rounded-full bg-muted-foreground/40" />
              <span>{product.brand.name}</span>
            </>
          )}
          <span className="inline-block size-0.5 rounded-full bg-muted-foreground/40" />
          <Star className="size-2.5 fill-amber-400 text-amber-400" />
          <span className="font-medium text-foreground/80">{Number(product.rating).toFixed(1)}</span>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-sm font-extrabold tabular-nums text-foreground">
          {hasSale ? (
            <>
              <span className="mr-1 text-[10px] font-medium text-muted-foreground line-through">
                {formatPrice(price)}
              </span>
              {formatPrice(salePrice!)}
            </>
          ) : (
            formatPrice(price)
          )}
        </p>
        {discount > 0 && (
          <p className="text-[10px] font-bold text-emerald-500">-{discount}%</p>
        )}
        <p className="text-[10px] text-muted-foreground">{formatCompactNumber(product.salesCount ?? 0)} ventas</p>
      </div>
    </Link>
  );
}
