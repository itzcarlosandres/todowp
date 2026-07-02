import { getProducts } from "@/modules/products";
import { ProductListCard } from "@/components/product/product-list-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface ProductListSectionProps {
  title: string;
  subtitle: string;
  filter: "featured" | "isNew" | "trending";
  seeAllHref: string;
  seeAllLabel: string;
  limit?: number;
  className?: string;
}

export async function ProductListSection({
  title,
  subtitle,
  filter,
  seeAllHref,
  seeAllLabel,
  limit = 5,
  className,
}: ProductListSectionProps) {
  const result = await getProducts({
    [filter]: true,
    sort: filter === "trending" ? "popular" : "newest",
    page: 1,
    perPage: limit,
  });

  if (result.products.length === 0) return null;

  return (
    <div className={className}>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <Button variant="ghost" size="sm" asChild className="text-xs">
          <Link href={seeAllHref}>
            {seeAllLabel}
            <ArrowRight className="ml-1 size-3.5" />
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-1.5">
        {result.products.map((product, i) => (
          <ProductListCard key={product.id} product={product} rank={i} />
        ))}
      </div>
    </div>
  );
}
