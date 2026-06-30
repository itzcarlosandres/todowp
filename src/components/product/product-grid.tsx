import { ProductCard } from "./product-card";
import type { ProductWithRelations } from "@/types/product";
import type { ProductListItem } from "@/modules/products/service";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: (ProductWithRelations | ProductListItem)[];
  className?: string;
  emptyMessage?: string;
  cols?: 2 | 3 | 4 | 5 | 6;
  view?: "grid" | "list";
}

export function ProductGrid({ products, className, emptyMessage, cols = 4, view = "grid" }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/30 py-20 text-center">
        <p className="text-sm text-muted-foreground">
          {emptyMessage ?? "No hay productos para mostrar"}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-4 sm:gap-6",
        view === "grid" && [
          cols === 2 && "grid-cols-2 sm:grid-cols-2",
          cols === 3 && "grid-cols-2 sm:grid-cols-3",
          cols === 4 && "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
          cols === 5 && "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
          cols === 6 && "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6",
        ],
        view === "list" && "grid-cols-1",
        className,
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} variant={view === "list" ? "list" : "default"} />
      ))}
    </div>
  );
}
