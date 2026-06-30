"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ArrowUpDown, LayoutGrid, List } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function SortAndView() {
  const t = useTranslations("products");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") ?? "newest";
  const view = searchParams.get("view") === "list" ? "list" : "grid";

  const setView = (newView: "grid" | "list") => {
    const params = new URLSearchParams(searchParams);
    params.set("view", newView);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        {searchParams.get("q") && (
          <>
            Resultados para{" "}
            <span className="font-semibold text-foreground">
              &quot;{searchParams.get("q")}&quot;
            </span>{" "}
            ·{" "}
          </>
        )}
        <span className="font-semibold text-foreground">
          {/* placeholder count */}
        </span>{" "}
        productos
      </p>

      <div className="flex items-center gap-2">
        <Select
          value={sort}
          onValueChange={(v) => {
            const params = new URLSearchParams(searchParams);
            params.set("sort", v);
            params.delete("page");
            router.push(`${pathname}?${params.toString()}`);
          }}
        >
          <SelectTrigger className="h-9 w-[180px]">
            <ArrowUpDown className="size-3.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{t("sort.newest")}</SelectItem>
            <SelectItem value="oldest">{t("sort.oldest")}</SelectItem>
            <SelectItem value="popular">{t("sort.popular")}</SelectItem>
            <SelectItem value="rating">{t("sort.rating")}</SelectItem>
            <SelectItem value="price-asc">{t("sort.priceAsc")}</SelectItem>
            <SelectItem value="price-desc">{t("sort.priceDesc")}</SelectItem>
            <SelectItem value="sales">{t("sort.sales")}</SelectItem>
          </SelectContent>
        </Select>

        <div className="hidden items-center rounded-lg border border-border/60 p-0.5 md:flex">
          <button
            onClick={() => setView("grid")}
            className={cn(
              "rounded-md p-1.5 transition-colors",
              view === "grid" ? "bg-accent" : "text-muted-foreground hover:text-foreground",
            )}
            aria-label={t("view.grid")}
          >
            <LayoutGrid className="size-3.5" />
          </button>
          <button
            onClick={() => setView("list")}
            className={cn(
              "rounded-md p-1.5 transition-colors",
              view === "list" ? "bg-accent" : "text-muted-foreground hover:text-foreground",
            )}
            aria-label={t("view.list")}
          >
            <List className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
