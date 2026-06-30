import { getProducts } from "@/modules/products";
import { getCategories } from "@/modules/categories";
import { getBrands } from "@/modules/brands";
import { productFiltersSchema } from "@/lib/validators";
import { ProductGrid } from "@/components/product/product-grid";
import { FilterSidebar } from "@/components/marketplace/filter-sidebar";
import { SortAndView } from "@/components/marketplace/sort-and-view";
import { generateMetadata as buildMetadata } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { db } from "@/lib/db";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("products");
  return buildMetadata({
    title: t("title"),
    description: t("subtitle"),
  });
}

export default async function MarketplacePage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const searchParamsAwaited = await searchParams;
  const filters = productFiltersSchema.parse(searchParamsAwaited);
  
  const [result, categories, brands, t, settingsList] = await Promise.all([
    getProducts(filters),
    getCategories(),
    getBrands(),
    getTranslations("products"),
    db.setting.findMany({
      where: {
        key: { in: ["store_products_default_view", "store_products_cols"] },
      },
    }),
  ]);

  const defaultViewSetting = String(settingsList.find(s => s.key === "store_products_default_view")?.value || "grid");
  const colsSetting = String(settingsList.find(s => s.key === "store_products_cols")?.value || "3");

  const queryView = searchParamsAwaited.view;
  const viewMode = (queryView === "list" || queryView === "grid") ? queryView : defaultViewSetting;
  const cols = parseInt(colsSetting, 10) as 2 | 3 | 4 | 5 | 6;

  return (
    <div className="container-fluid py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="flex gap-8">
        <FilterSidebar
          categories={categories.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            count: c._count.products,
          }))}
          brands={brands.map((b) => ({
            id: b.id,
            name: b.name,
            slug: b.slug,
            count: b._count.products,
          }))}
          priceRange={result.facets.priceRange}
        />

        <div className="min-w-0 flex-1 space-y-6">
          <SortAndView />

          <div className="flex items-center justify-between text-sm">
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">{result.total}</span>{" "}
              resultados
            </p>
          </div>

          <ProductGrid
            products={result.products}
            cols={cols}
            view={viewMode as "list" | "grid"}
            emptyMessage="No se encontraron productos con esos filtros"
          />

          {result.totalPages > 1 && (
            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              basePath="/products"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  basePath,
}: {
  page: number;
  totalPages: number;
  basePath: string;
}) {
  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1;
    if (page <= 4) return i + 1;
    if (page >= totalPages - 3) return totalPages - 6 + i;
    return page - 3 + i;
  });

  return (
    <nav className="mt-8 flex items-center justify-center gap-2">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
        const active = p === page;
        return (
          <a
            key={p}
            href={`${basePath}?page=${p}`}
            className={`flex size-9 items-center justify-center rounded-md text-sm font-medium transition-colors ${
              active
                ? "bg-primary text-primary-foreground"
                : "border border-border/60 hover:bg-accent"
            }`}
          >
            {p}
          </a>
        );
      })}
    </nav>
  );
}
