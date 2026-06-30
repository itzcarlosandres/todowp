"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Download, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PriceTag } from "@/components/shared/price-tag";
import { StarRating } from "@/components/shared/star-rating";
import { formatCompactNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ProductWithRelations } from "@/types/product";
import type { ProductListItem } from "@/modules/products/service";

interface ProductCardProps {
  product: ProductWithRelations | ProductListItem;
  locale?: string;
  className?: string;
  variant?: "default" | "compact" | "featured" | "list";
}

export function ProductCard({ product, className, variant = "default" }: ProductCardProps) {
  if (variant === "list") {
    return (
      <Card
        className={cn(
          "group relative flex flex-col sm:flex-row overflow-hidden border-border/60 transition-all duration-300 card-hover hover:border-brand-500/40 hover:shadow-lg hover:shadow-brand-500/5",
          className,
        )}
      >
        <Link href={`/product/${product.slug}`} className="block sm:w-64 shrink-0">
          <div className="relative aspect-[4/3] sm:aspect-square sm:h-full overflow-hidden bg-muted">
            <Image
              src={product.coverImage}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 100vw, 256px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            
            <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
              {product.isNew && (
                <Badge className="bg-brand-100 text-brand-700 hover:bg-brand-200 border-none shadow-sm font-semibold">
                  Nuevo
                </Badge>
              )}
              {product.salePrice && Number(product.salePrice) < Number(product.price) && (
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none shadow-sm font-semibold">
                  Oferta
                </Badge>
              )}
            </div>
            

          </div>
        </Link>

        <CardContent className="flex flex-1 flex-col p-4 sm:p-6 justify-center">
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            {product.brand && (
              <span className="font-medium text-foreground/80">
                {product.brand.name}
              </span>
            )}
            {product.category && (
              <>
                <span>•</span>
                <span>{product.category.name}</span>
              </>
            )}
          </div>

          <Link href={`/product/${product.slug}`}>
            <h3 className="line-clamp-2 text-lg font-semibold leading-snug transition-colors group-hover:text-primary">
              {product.title}
            </h3>
          </Link>

          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {product.description || "Sin descripción detallada."}
          </p>

          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="size-3 fill-warning stroke-warning" />
              <span className="font-medium text-foreground">{product.rating.toFixed(1)}</span>
              <span>({product.reviewCount})</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Download className="size-3" />
              <span>{formatCompactNumber(product.salesCount)} ventas</span>
            </div>
          </div>

          <div className="mt-auto pt-4 flex flex-wrap items-center justify-between gap-4">
            <PriceTag
              price={Number(product.price)}
              salePrice={product.salePrice ? Number(product.salePrice) : null}
              currency={product.currency}
              size="lg"
            />
            <Button
              variant="brand"
              className="shadow-sm"
              asChild
            >
              <Link href={`/product/${product.slug}`}>
                Ver Detalles
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-border/60 transition-all duration-300 card-hover hover:border-brand-500/40 hover:shadow-lg hover:shadow-brand-500/5",
        className,
      )}
    >
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <Image
            src={product.coverImage}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {product.isNew && (
              <Badge className="bg-brand-100 text-brand-700 hover:bg-brand-200 border-none shadow-sm font-semibold">
                Nuevo
              </Badge>
            )}
            {product.trending && (
              <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none shadow-sm font-semibold">
                Trending
              </Badge>
            )}
            {product.featured && (
              <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-none shadow-sm font-semibold">
                Destacado
              </Badge>
            )}
            {product.salePrice && Number(product.salePrice) < Number(product.price) && (
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none shadow-sm font-semibold">
                Oferta
              </Badge>
            )}
          </div>



          {variant === "featured" && (
            <div className="absolute inset-x-0 bottom-0 translate-y-full p-3 transition-transform duration-300 group-hover:translate-y-0">
              <div className="flex gap-2">
                <Button
                  variant="brand"
                  size="sm"
                  className="flex-1 shadow-lg"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <ShoppingCart className="size-3.5" />
                  Añadir
                </Button>
                <Button
                  variant="secondary"
                  size="icon-sm"
                  className="bg-background/90 backdrop-blur-md"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <Download className="size-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
          {product.brand && (
            <span className="font-medium text-foreground/80">
              {product.brand.name}
            </span>
          )}
          {product.category && (
            <>
              <span>•</span>
              <span>{product.category.name}</span>
            </>
          )}
        </div>

        <Link href={`/product/${product.slug}`}>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug transition-colors group-hover:text-primary">
            {product.title}
          </h3>
        </Link>

        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="size-3 fill-warning stroke-warning" />
            <span className="font-medium text-foreground">{product.rating.toFixed(1)}</span>
            <span>({product.reviewCount})</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Download className="size-3" />
            <span>{formatCompactNumber(product.salesCount)} ventas</span>
          </div>
        </div>

        <div className="mt-3 flex items-end justify-between">
          <PriceTag
            price={Number(product.price)}
            salePrice={product.salePrice ? Number(product.salePrice) : null}
            currency={product.currency}
            size={variant === "compact" ? "sm" : "md"}
          />
        </div>
      </CardContent>
    </Card>
  );
}
