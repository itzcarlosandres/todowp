import Link from "next/link";
import Image from "next/image";
import { Star, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCompactNumber, discountPercent } from "@/lib/format";
import type { ProductListItem } from "@/modules/products";

const TYPE_LABELS: Record<string, string> = {
  THEME: "Theme",
  PLUGIN: "Plugin",
  SCRIPT: "Script",
  TEMPLATE: "Template",
  SAAS: "SaaS",
  LICENSE: "Licencia",
  GIFT_CARD: "Gift Card",
  ICON_PACK: "Iconos",
  GRAPHICS: "Gráficos",
  EMAIL_TEMPLATE: "Email",
  LANDING_PAGE: "Landing",
  MOBILE_APP: "App",
  OTHER: "Otro",
};

interface FeaturedProductCardProps {
  product: ProductListItem;
  index?: number;
}

export function FeaturedProductCard({ product, index = 0 }: FeaturedProductCardProps) {
  const hasSale = product.salePrice != null && Number(product.salePrice) < Number(product.price);
  const discount = hasSale ? discountPercent(Number(product.price), Number(product.salePrice)) : 0;
  const saleCount = product.salesCount ?? 0;

  const badgeLabel = index === 0 ? "TOP" : index === 1 ? "TOP" : index === 2 ? "NEW" : "TOP";
  const badgeClass = index === 2 ? "ol-new" : "ol-feat";

  const tags = [
    product.type ? TYPE_LABELS[product.type] ?? product.type : null,
    product.category?.name ?? null,
  ].filter(Boolean) as string[];

  return (
    <div className="group relative flex min-h-[170px] overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-card to-card/80 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-500/20 hover:shadow-xl hover:shadow-brand-500/5">
      <div className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none bg-[radial-gradient(ellipse_at_20%_50%,rgba(99,102,241,0.06)_0%,transparent_60%),radial-gradient(ellipse_at_80%_50%,rgba(168,85,247,0.04)_0%,transparent_60%)]" />

      <Link href={`/product/${product.slug}`} className="absolute inset-0 z-10" aria-label={product.title} />

      <div className="relative z-10 w-[155px] shrink-0 overflow-hidden max-sm:w-[120px] pointer-events-none">
        <Image
          src={product.coverImage || "/placeholder-product.svg"}
          alt={product.title}
          fill
          className="object-cover transition-all duration-500 brightness-[0.82] group-hover:brightness-100 group-hover:scale-[1.06]"
          sizes="155px"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-card/80" />
        <span
          className={cn(
            "absolute left-2.5 top-2.5 z-20 rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-sm",
            badgeClass === "ol-new"
              ? "bg-emerald-500/85 text-white shadow-sm shadow-emerald-500/20"
              : "bg-gradient-to-br from-violet-500/85 to-fuchsia-500/85 text-white shadow-sm shadow-violet-500/20",
          )}
        >
          {badgeLabel}
        </span>
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-between min-w-0 p-3.5 sm:p-4 pointer-events-none">
        <div>
          <span className="inline-block rounded border border-brand-500/15 bg-brand-500/5 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-600 dark:text-brand-400 mb-1">
            {tags.join(" · ")}
          </span>
          <h3 className="text-sm font-semibold leading-snug tracking-tight text-foreground line-clamp-1 sm:text-[15px]">
            {product.title}
          </h3>
          {product.subtitle && (
            <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground line-clamp-2 sm:text-xs">
              {product.subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 mt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-extrabold tracking-tight text-foreground sm:text-lg">
              ${hasSale ? Number(product.salePrice).toFixed(0) : Number(product.price).toFixed(0)}
            </span>
            {hasSale && (
              <>
                <span className="text-xs text-muted-foreground line-through">
                  ${Number(product.price).toFixed(0)}
                </span>
                <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-1 py-px text-[10px] font-bold text-emerald-500">
                  -{discount}%
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Star className="size-2.5 fill-amber-400 text-amber-400" />
            <span className="font-medium text-foreground">{Number(product.rating).toFixed(1)}</span>
            <span className="hidden sm:inline">{formatCompactNumber(saleCount)} ventas</span>
          </div>
        </div>

        {product.brand && (
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
            {product.brand.logo ? (
              <Image src={product.brand.logo} alt={product.brand.name} width={14} height={14} className="rounded-full" />
            ) : (
              <div className="size-3.5 rounded-full bg-muted" />
            )}
            <span>{product.brand.name}</span>
          </div>
        )}

        <Link
          href={`/product/${product.slug}`}
          className="pointer-events-auto relative z-20 mt-2.5 inline-flex w-fit items-center gap-1 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-md shadow-brand-500/20 transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-brand-500/30 sm:px-3.5 sm:text-xs"
        >
          <ShoppingCart className="size-3" />
          Comprar
        </Link>
      </div>
    </div>
  );
}
