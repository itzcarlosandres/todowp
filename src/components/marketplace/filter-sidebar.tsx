"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronDown, X, SlidersHorizontal, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface Category {
  id: string;
  name: string;
  slug: string;
  count?: number;
}
interface Brand {
  id: string;
  name: string;
  slug: string;
  count?: number;
}

interface FilterSidebarProps {
  categories: Category[];
  brands: Brand[];
  priceRange: { min: number; max: number };
  className?: string;
}

export function FilterSidebar({ categories, brands, priceRange, className }: FilterSidebarProps) {
  const t = useTranslations("products");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [openMobile, setOpenMobile] = React.useState(false);
  const [search, setSearch] = React.useState(searchParams.get("q") ?? "");

  const updateParams = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value === null || value === "") params.delete(key);
    else params.set(key, value);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleArrayParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    const current = params.get(key)?.split(",").filter(Boolean) ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    if (next.length === 0) params.delete(key);
    else params.set(key, next.join(","));
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAll = () => router.push(pathname);

  const selectedCategories = searchParams.get("category")?.split(",") ?? [];
  const selectedBrands = searchParams.get("brand")?.split(",") ?? [];
  const minPrice = Number(searchParams.get("minPrice") ?? priceRange.min);
  const maxPrice = Number(searchParams.get("maxPrice") ?? priceRange.max);
  const rating = Number(searchParams.get("rating") ?? 0);

  const activeFilters = [
    ...selectedCategories.map((c) => ({ key: "category", value: c, label: categories.find((x) => x.slug === c)?.name ?? c })),
    ...selectedBrands.map((b) => ({ key: "brand", value: b, label: brands.find((x) => x.slug === b)?.name ?? b })),
    ...(minPrice > priceRange.min ? [{ key: "minPrice", value: String(minPrice), label: `Min $${minPrice}` }] : []),
    ...(maxPrice < priceRange.max ? [{ key: "maxPrice", value: String(maxPrice), label: `Max $${maxPrice}` }] : []),
    ...(rating > 0 ? [{ key: "rating", value: String(rating), label: `${rating}+ ★` }] : []),
  ];

  const FilterContent = (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("search")}
        </Label>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateParams("q", search || null);
          }}
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="pl-9"
            />
          </div>
        </form>
      </div>

      {/* Price */}
      <div>
        <Label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("filters.price.title")}
        </Label>
        <div className="space-y-3">
          <Slider
            min={priceRange.min}
            max={priceRange.max}
            step={1}
            value={[minPrice, maxPrice]}
            onValueChange={([lo, hi]) => {
              const params = new URLSearchParams(searchParams);
              if (lo != null && lo > priceRange.min) params.set("minPrice", String(lo));
              else params.delete("minPrice");
              if (hi != null && hi < priceRange.max) params.set("maxPrice", String(hi));
              else params.delete("maxPrice");
              params.delete("page");
              router.push(`${pathname}?${params.toString()}`);
            }}
            className="mt-2"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>${minPrice}</span>
            <span>${maxPrice === Number.MAX_SAFE_INTEGER ? priceRange.max : maxPrice}</span>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div>
        <Label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("filters.category")}
        </Label>
        <div className="space-y-2">
          {categories.slice(0, 10).map((c) => (
            <label
              key={c.id}
              className="flex cursor-pointer items-center gap-2 rounded-md p-1.5 text-sm transition-colors hover:bg-accent/50"
            >
              <Checkbox
                checked={selectedCategories.includes(c.slug)}
                onCheckedChange={() => toggleArrayParam("category", c.slug)}
              />
              <span className="flex-1">{c.name}</span>
              {c.count != null && (
                <span className="text-xs text-muted-foreground">{c.count}</span>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div>
        <Label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("filters.brand")}
        </Label>
        <div className="space-y-2">
          {brands.slice(0, 10).map((b) => (
            <label
              key={b.id}
              className="flex cursor-pointer items-center gap-2 rounded-md p-1.5 text-sm transition-colors hover:bg-accent/50"
            >
              <Checkbox
                checked={selectedBrands.includes(b.slug)}
                onCheckedChange={() => toggleArrayParam("brand", b.slug)}
              />
              <span className="flex-1">{b.name}</span>
              {b.count != null && (
                <span className="text-xs text-muted-foreground">{b.count}</span>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <Label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("filters.rating")}
        </Label>
        <div className="space-y-1">
          {[4, 3, 2, 1].map((r) => (
            <button
              key={r}
              onClick={() => updateParams("rating", rating === r ? null : String(r))}
              className={cn(
                "flex w-full items-center gap-1 rounded-md p-1.5 text-sm transition-colors hover:bg-accent/50",
                rating === r && "bg-accent",
              )}
            >
              <span>{r}+</span>
              <span className="text-warning">★</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-20 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">{t("filters.title")}</h2>
            {activeFilters.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAll}>
                {t("filters.clear")}
              </Button>
            )}
          </div>

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {activeFilters.map((f) => (
                <Badge
                  key={`${f.key}-${f.value}`}
                  variant="secondary"
                  className="cursor-pointer gap-1"
                  onClick={() => updateParams(f.key, null)}
                >
                  {f.label}
                  <X className="size-3" />
                </Badge>
              ))}
            </div>
          )}

          {FilterContent}
        </div>
      </aside>

      {/* Mobile button */}
      <Button
        variant="outline"
        size="sm"
        className="lg:hidden"
        onClick={() => setOpenMobile(true)}
      >
        <SlidersHorizontal className="size-4" />
        Filtros
        {activeFilters.length > 0 && (
          <Badge variant="brand" className="ml-1 size-5 rounded-full p-0 text-[10px]">
            {activeFilters.length}
          </Badge>
        )}
      </Button>

      <AnimatePresence>
        {openMobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpenMobile(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="fixed bottom-0 left-0 top-0 z-50 w-80 max-w-[85vw] overflow-y-auto bg-background p-6 lg:hidden"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">{t("filters.title")}</h2>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setOpenMobile(false)}
                >
                  <X className="size-4" />
                </Button>
              </div>
              {FilterContent}
              <div className="mt-6 flex gap-2">
                <Button variant="outline" className="flex-1" onClick={clearAll}>
                  {t("filters.clear")}
                </Button>
                <Button variant="brand" className="flex-1" onClick={() => setOpenMobile(false)}>
                  {t("filters.apply")}
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
