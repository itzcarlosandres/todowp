"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ShoppingCart, Heart, Download, ExternalLink, FileText, Star, Check, Zap, Eye, Play } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PriceTag } from "@/components/shared/price-tag";
import { StarRating } from "@/components/shared/star-rating";
import { formatCompactNumber, formatPrice } from "@/lib/format";
import { formatRelativeDate } from "@/lib/date";
import { useCartStore } from "@/store/cart-store";

import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ProductWithRelations } from "@/types/product";
import { CashbackBadge } from "@/components/cashback/cashback-badge";

interface ProductBuyBoxProps {
  product: ProductWithRelations;
  hasAccess?: boolean;
}

export function ProductBuyBox({ product, hasAccess }: ProductBuyBoxProps) {
  const t = useTranslations("product");
  const tCommon = useTranslations("common");
  const addToCart = useCartStore((s) => s.add);
  const openCart = useCartStore((s) => s.open);

  const [downloading, setDownloading] = React.useState(false);

  const handleAdd = () => {
    addToCart({
      productId: product.id,
      productSlug: product.slug,
      productTitle: product.title,
      productImage: product.coverImage,
      price: Number(product.price),
      salePrice: product.salePrice ? Number(product.salePrice) : null,
      license: "SINGLE",
    });
    toast.success(tCommon("addedToCart"));
    openCart();
  };

  const handleDownload = async () => {
    const versionId = product.versions[0]?.id;
    if (!versionId) {
      toast.error("No hay archivos disponibles para descargar.");
      return;
    }
    
    setDownloading(true);
    toast.info("Iniciando descarga...");
    
    // Redirect to the download API endpoint
    window.location.href = `/api/download/${versionId}`;
    
    setTimeout(() => {
      setDownloading(false);
    }, 3000);
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
          {product.brand && (
            <span className="font-medium text-foreground/80">{product.brand.name}</span>
          )}
          {product.category && (
            <>
              <span>•</span>
              <span>{product.category.name}</span>
            </>
          )}
        </div>
        <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight md:text-4xl">
          {product.title}
        </h1>
        {product.subtitle && (
          <p className="mt-3 text-pretty text-base text-muted-foreground">
            {product.subtitle}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <StarRating rating={product.rating} showValue count={product.reviewCount} size="md" />
        <Separator orientation="vertical" className="h-4" />
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Download className="size-3.5" />
          <span>{formatCompactNumber(product.salesCount)} {tCommon("sales")}</span>
        </div>
        <Separator orientation="vertical" className="h-4" />
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Eye className="size-3.5" />
          <span>{formatCompactNumber(product.viewCount)} vistas</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {product.isNew && <Badge variant="brand">Nuevo</Badge>}
        {product.trending && <Badge variant="warning">Trending</Badge>}
        {product.featured && <Badge variant="default">Destacado</Badge>}
        {product.tags.slice(0, 4).map((tag) => (
          <Badge key={tag} variant="secondary">
            {tag}
          </Badge>
        ))}
      </div>

      <Separator />

      <PriceTag
        price={Number(product.price)}
        salePrice={product.salePrice ? Number(product.salePrice) : null}
        currency={product.currency}
        size="xl"
      />

      <CashbackBadge price={Number(product.price)} />

      {/* Actions */}
      <div className="space-y-2">
        {hasAccess ? (
          <Button variant="brand" size="xl" className="w-full" onClick={handleDownload} disabled={downloading}>
            <Download className="size-5 mr-2" />
            Descargar Directamente
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="brand"
              size="default"
              className="flex-1 relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(99,102,241,0.45)] hover:brightness-110 active:scale-[0.98]"
              onClick={handleAdd}
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <ShoppingCart className="size-4 mr-2 relative z-10" />
              <span className="relative z-10">{tCommon("addToCart")}</span>
            </Button>
            {(product.demoUrl || product.previewUrl) && (
              <Button variant="outline" size="default" asChild className="border-brand-500/30 text-brand-500 hover:bg-brand-500/10 shrink-0 whitespace-nowrap">
                <a href={(product.demoUrl || product.previewUrl)!} target="_blank" rel="noreferrer">
                  <Play className="size-4 mr-2" />
                  {tCommon("liveDemo")}
                </a>
              </Button>
            )}
          </div>
        )}
      </div>

      <Separator />

      {/* Quick info */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <Info label={t("info.version")} value={`v${product.versions[0]?.version ?? "1.0.0"}`} />
        <Info label={t("info.updated")} value={formatRelativeDate(product.versions[0]?.releasedAt ?? product.updatedAt)} />
        {product.fileSize && (
          <Info label={t("info.fileSize")} value={`${(product.fileSize / 1024 / 1024).toFixed(1)} MB`} />
        )}
        <Info label={t("info.fileType")} value={product.fileType ?? "zip"} />
      </div>

      {/* Trust */}
      <div className="rounded-lg border border-success/20 bg-success/5 p-3 text-sm">
        <div className="flex items-start gap-2">
          <Zap className="mt-0.5 size-4 text-success" />
          <div>
            <p className="font-medium text-success">Descarga instantánea</p>
            <p className="text-xs text-muted-foreground">Accede al producto inmediatamente después del pago</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
