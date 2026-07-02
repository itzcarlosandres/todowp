import { getProducts } from "@/modules/products";
import { Section, SectionHeader } from "@/components/shared/section";
import { FeaturedProductCard } from "@/components/product/featured-product-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface FeaturedHorizontalSectionProps {
  title: string;
  subtitle: string;
  filter: "featured" | "isNew" | "trending";
  seeAllHref: string;
  seeAllLabel: string;
  limit?: number;
}

export async function FeaturedHorizontalSection({
  title,
  subtitle,
  filter,
  seeAllHref,
  seeAllLabel,
  limit = 4,
}: FeaturedHorizontalSectionProps) {
  const result = await getProducts({
    [filter]: true,
    sort: filter === "trending" ? "popular" : "newest",
    page: 1,
    perPage: limit,
  });

  if (result.products.length === 0) return null;

  return (
    <Section containerSize="wide" spacing="default">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <SectionHeader title={title} subtitle={subtitle} className="mb-0" />
          <Button variant="ghost" size="sm" asChild>
            <Link href={seeAllHref}>
              {seeAllLabel}
              <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {result.products.map((product, i) => (
            <FeaturedProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </Section>
  );
}
