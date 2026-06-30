import * as React from "react";
import { getCategories } from "@/modules/categories";
import { Section, SectionHeader } from "@/components/shared/section";
import Link from "next/link";
import * as Icons from "lucide-react";
import { ArrowRight } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Palette: Icons.Palette,
  Puzzle: Icons.Puzzle,
  Layout: Icons.Layout,
  Code2: Icons.Code2,
  Cloud: Icons.Cloud,
  Smartphone: Icons.Smartphone,
  Sparkles: Icons.Sparkles,
  Mail: Icons.Mail,
  Rocket: Icons.Rocket,
  Box: Icons.Box,
  Key: Icons.Key,
  Gift: Icons.Gift,
};

export async function CategoryGrid() {
  const t = await import("next-intl/server").then((m) => m.getTranslations("home.categories"));
  const categories = await getCategories();

  return (
    <Section>
      <SectionHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {categories.slice(0, 12).map((category, idx) => {
          const Icon = iconMap[category.icon ?? "Sparkles"] ?? Icons.Sparkles;
          return (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group relative flex flex-col items-center gap-3 overflow-hidden rounded-xl border border-border/60 bg-card p-5 text-center transition-all duration-300 card-hover hover:border-brand-500/40 hover:shadow-lg hover:shadow-brand-500/10"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div
                className="flex size-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                style={{
                  backgroundColor: `${category.color}15`,
                  color: category.color ?? "#7C3AED",
                }}
              >
                <Icon className="size-6" />
              </div>
              <div>
                <p className="line-clamp-1 text-sm font-semibold">{category.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {category._count.products} productos
                </p>
              </div>
              <ArrowRight className="absolute right-3 top-3 size-3.5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
            </Link>
          );
        })}
      </div>
    </Section>
  );
}
