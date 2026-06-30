import { getProducts } from "@/modules/products";
import { Section, SectionHeader } from "@/components/shared/section";
import { ProductGrid } from "@/components/product/product-grid";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface FeaturedSectionProps {
  title: string;
  subtitle: string;
  filter: "featured" | "isNew" | "trending";
  seeAllHref: string;
  seeAllLabel: string;
  limit?: number;
  cols?: 2 | 3 | 4 | 5 | 6;
}

export async function FeaturedSection({
  title,
  subtitle,
  filter,
  seeAllHref,
  seeAllLabel,
  limit = 8,
  cols = 4,
}: FeaturedSectionProps) {
  const result = await getProducts({
    [filter]: true,
    sort: filter === "trending" ? "popular" : "newest",
    page: 1,
    perPage: limit,
  });

  if (result.products.length === 0) return null;

  return (
    <Section containerSize="wide">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <SectionHeader title={title} subtitle={subtitle} className="mb-0" />
        <Button variant="ghost" size="sm" asChild>
          <Link href={seeAllHref}>
            {seeAllLabel}
            <ArrowRight className="ml-1 size-4" />
          </Link>
        </Button>
      </div>
      <ProductGrid products={result.products} cols={cols} />
    </Section>
  );
}
